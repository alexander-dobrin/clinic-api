import { Appointment } from './appointment';
import { DateTime } from 'luxon';
import { AppointmentRepository } from './appointment-repository';
import { PatientService } from '../patient/patient-service';
import { DoctorService } from '../doctor/doctor-service';
import { CreateAppointmentDto } from './dto/create-appointment-dto';
import { UpdateAppointmentDto } from './dto/update-appointment-dto';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { GetOptions } from '../common/types';
import { ErrorMessageEnum, StatusCodeEnum } from '../common/enums';
import { HttpError } from '../common/errors';
import { validDto, validateDto } from '../common/decorator/validate-dto';
import { RepositoryUtils } from '../common/util/repository-utils';
import { DataSource, EntityNotFoundError, QueryFailedError } from 'typeorm';
import { iocContainer } from '../common/config/inversify.config';

@injectable()
export class AppointmentService {
	constructor(
		@inject(CONTAINER_TYPES.APPOINTMENT_REPOSITORY)
		private readonly appointmentRepository: AppointmentRepository,
		@inject(CONTAINER_TYPES.PATIENT_SERVICE) private readonly patientsService: PatientService,
		@inject(CONTAINER_TYPES.DOCTOR_SERVICE) private readonly doctorsService: DoctorService,
	) {}

	@validateDto
	public async create(
		@validDto(CreateAppointmentDto) appointmentDto: CreateAppointmentDto,
	): Promise<Appointment> {
		const { patientId, doctorId, date } = appointmentDto;
		const doctor = await this.doctorsService.getById(doctorId);
		const patient = await this.patientsService.getById(patientId);
		const appointment = this.appointmentRepository.create({
			doctor,
			patient,
			date: DateTime.fromISO(date, { zone: 'utc' }),
		});
		await this.doctorsService.takeFreeSlot(doctorId, appointment.date);

		// Review: возвращать созданный объект с загруженными зависимостями, или удалять эти поля?
		return this.appointmentRepository.save(appointment);
	}

	public async get(options: GetOptions): Promise<Appointment[]> {
		try {
			return await RepositoryUtils.findMatchingOptions(this.appointmentRepository, options);
		} catch (err) {
			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				throw new HttpError(StatusCodeEnum.BAD_REQUEST, ErrorMessageEnum.UNKNOWN_QUERY_PARAMETER);
			}
			throw err;
		}
	}

	public async getById(id: string): Promise<Appointment | null> {
		try {
			const appointment = await this.appointmentRepository.findOneByOrFail({ id });
			return appointment;
		} catch (err) {
			if (err instanceof EntityNotFoundError) {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Appointment [${id}] not found`);
			}
			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Appointment [${id}] not found`);
			}
			throw err;
		}
	}

	@validateDto
	public async update(
		id: string,
		@validDto(UpdateAppointmentDto) appointmentDto: UpdateAppointmentDto,
	): Promise<Appointment> {
		const appointment = await this.getById(id);
		const { patientId, doctorId = appointment.doctorId, date, version } = appointmentDto;

		if (appointment.version && appointment.version != version) {
			throw new HttpError(StatusCodeEnum.CONFLICT, ErrorMessageEnum.VERSION_MISMATCH);
		}

		appointment.doctorId = doctorId;
		appointment.patientId = patientId;

		const queryRunner = iocContainer
			.get<DataSource>(CONTAINER_TYPES.DB_CONNECTION)
			.createQueryRunner();
		queryRunner.startTransaction();

		try {
			if (date) {
				appointment.date = DateTime.fromISO(date, { zone: 'utc' });
				await this.doctorsService.takeFreeSlot(doctorId, appointment.date, queryRunner.manager);
			}
			const saved = await queryRunner.manager.save(appointment);
			await queryRunner.commitTransaction();
			return saved;
		} catch (err) {
			await queryRunner.rollbackTransaction();
			if (err instanceof QueryFailedError) {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Patient [${patientId}] not found`);
			}
			throw err;
		} finally {
			await queryRunner.release();
		}
	}

	public async delete(id: string): Promise<void> {
		try {
			const res = await this.appointmentRepository.delete(id);
			if (!res.affected) {
				throw new HttpError(
					StatusCodeEnum.CONFLICT,
					`Appointment [${id}] might be allready deleted`,
				);
			}
		} catch (err) {
			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Appointment [${id}] not found`);
			}
			throw err;
		}
	}
}

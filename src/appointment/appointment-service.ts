import { AppointmentModel } from './appointment-model';
import { DateTime } from 'luxon';
import { AppointmentRepository } from './appointment-repository';
import { PatientService } from '../patient/patient-service';
import { DoctorService } from '../doctor/doctor-service';
import { CreateAppointmentDto } from './dto/create-appointment-dto';
import { UpdateAppointmentDto } from './dto/update-appointment-dto';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { GetOptions } from '../common/types';
import { StatusCodeEnum } from '../common/enums';
import { HttpError } from '../common/errors';
import { validDto, validateDto } from '../common/decorator/validate-dto';
import { RepositoryUtils } from '../common/util/repository-utils';
import { QueryFailedError } from 'typeorm';

@injectable()
export class AppointmentService {
	constructor(
		@inject(CONTAINER_TYPES.APPOINTMENTS_REPOSITORY)
		private readonly appointmentRepository: AppointmentRepository,
		@inject(CONTAINER_TYPES.PATIENTS_SERVICE) private readonly patientsService: PatientService,
		@inject(CONTAINER_TYPES.DOCTORS_SERVICE) private readonly doctorsService: DoctorService,
	) {}

	@validateDto
	public async create(
		@validDto(CreateAppointmentDto) appointmentDto: CreateAppointmentDto,
	): Promise<AppointmentModel> {
		const { patientId, doctorId, date } = appointmentDto;
		const doctor = await this.doctorsService.getById(doctorId);
		const patient = await this.patientsService.getById(patientId);
		const appointment = this.appointmentRepository.create({
			doctor,
			patient,
			date: DateTime.fromISO(date, { zone: 'utc' }),
		});
		await this.doctorsService.takeFreeSlot(doctorId, appointment.date);
		return this.appointmentRepository.save(appointment);
	}

	public async read(options: GetOptions): Promise<AppointmentModel[]> {
		return RepositoryUtils.findMatchingOptions(this.appointmentRepository, options);
	}

	public async getById(id: string): Promise<AppointmentModel | null> {
		try {
			const appointment = await this.appointmentRepository.findOneBy({ id });
			if (!appointment) {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Appointment [${id}] not found`);
			}
			return appointment;
		} catch (err) {
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
	): Promise<AppointmentModel> {
		const appointment = await this.getById(id);
		const { patientId = appointment.patientId, doctorId = appointment.doctorId } = appointmentDto;
		if (appointmentDto.date) {
			appointment.date = DateTime.fromISO(appointmentDto.date, { zone: 'utc' });
		}
		appointment.doctorId = doctorId;
		appointment.patientId = patientId;
		try {
			// TODO: TRANSACTION?
			const saved = await this.appointmentRepository.save(appointment);
			await this.doctorsService.takeFreeSlot(doctorId, appointment.date);
			return saved;
		} catch (err) {
			if (err instanceof QueryFailedError) {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Patient [${id}] not found`);
			}
			throw err;
		}
	}

	public async delete(id: string): Promise<void> {
		try {
			const res = await this.appointmentRepository.delete(id);
			if (!res.affected) {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Appointment [${id}] not found`);
			}
		} catch (err) {
			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Patient [${id}] not found`);
			}
			throw err;
		}
	}
}

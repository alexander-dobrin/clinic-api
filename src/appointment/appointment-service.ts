import { AppointmentModel } from './appointment-model';
import { DateTime } from 'luxon';
import { v4 } from 'uuid';
import { AppointmentRepository } from './appointment-repository';
import { PatientService } from '../patient/patient-service';
import { DoctorService } from '../doctor/doctor-service';
import { CreateAppointmentDto } from './dto/create-appointment-dto';
import { plainToClass } from 'class-transformer';
import { UpdateAppointmentDto } from './dto/update-appointment-dto';
import { merge } from 'lodash';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { IFilterParam, IQueryParams } from '../common/types';
import { AppointmentsFilterByEnum, ErrorMessageEnum, StatusCodeEnum } from '../common/enums';
import { HttpError } from '../common/errors';
import { validDto, validateDto } from '../common/decorator';

@injectable()
export class AppointmentService {
	constructor(
		@inject(CONTAINER_TYPES.APPOINTMENTS_REPOSITORY)
		private readonly repository: AppointmentRepository,
		@inject(CONTAINER_TYPES.PATIENTS_SERVICE) private readonly patientsService: PatientService,
		@inject(CONTAINER_TYPES.DOCTORS_SERVICE) private readonly doctorsService: DoctorService,
	) {}

	@validateDto
	public async create(
		@validDto(CreateAppointmentDto) appointmentDto: CreateAppointmentDto,
	): Promise<AppointmentModel> {
		const { patientId, doctorId, date } = appointmentDto;

		if (!(await this.patientsService.isExists(patientId))) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `Patient [${patientId}] not found`);
		}

		const appointment = plainToClass(AppointmentModel, { id: v4(), ...appointmentDto });
		await this.doctorsService.takeFreeSlot(doctorId, DateTime.fromISO(date, { zone: 'utc' }));

		return this.repository.add(appointment);
	}

	public async read(options: IQueryParams): Promise<AppointmentModel[]> {
		let appointments = await this.repository.getAll();
		if (options.filterBy) {
			appointments = this.filterAppointments(appointments, options.filterBy);
		}
		return appointments;
	}

	private filterAppointments(
		appointments: AppointmentModel[],
		filterParams: IFilterParam[],
	): AppointmentModel[] {
		let filtered = appointments;
		for (const param of filterParams) {
			param.field = param.field.toLowerCase();
			if (param.field === AppointmentsFilterByEnum.DOCTORS) {
				filtered = this.filterByDoctors(appointments, param.value);
			} else if (param.field === AppointmentsFilterByEnum.PATIENTS) {
				filtered = this.filterByPatients(appointments, param.value);
			} else {
				throw new HttpError(
					StatusCodeEnum.BAD_REQUEST,
					ErrorMessageEnum.UNKNOWN_QUERY_PARAMETER.replace('%s', param.field),
				);
			}
		}
		return filtered;
	}

	private filterByDoctors(appointments: AppointmentModel[], doctorId: string): AppointmentModel[] {
		return appointments.filter((a) => a.doctorId === doctorId);
	}

	private filterByPatients(
		appointments: AppointmentModel[],
		patientId: string,
	): AppointmentModel[] {
		return appointments.filter((a) => a.patientId === patientId);
	}

	public async getAppointmentById(id: string): Promise<AppointmentModel> {
		const appointment = await this.repository.get(id);
		if (!appointment) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `Appointment [${id}] not found`);
		}
		return appointment;
	}

	@validateDto
	public async update(
		id: string,
		@validDto(UpdateAppointmentDto) appointmentDto: UpdateAppointmentDto,
	): Promise<AppointmentModel> {
		let appointment = await this.getAppointmentById(id);

		const { patientId = appointment.patientId, doctorId = appointment.doctorId } = appointmentDto;

		if (!(await this.patientsService.isExists(patientId))) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `Patient [${patientId}] not found`);
		}
		// Review: use merge or create new appointment manually with constructor
		merge(appointment, appointmentDto);
		appointment = plainToClass(AppointmentModel, appointment);
		await this.doctorsService.takeFreeSlot(doctorId, appointment.date);

		return this.repository.update(appointment);
	}

	public async delete(id: string): Promise<AppointmentModel> {
		const appointment = await this.getAppointmentById(id);
		return this.repository.remove(appointment);
	}

	public async getAllDoctorAppointments(id: string): Promise<AppointmentModel[]> {
		return (await this.repository.getAll()).filter((a) => a.doctorId === id);
	}
}

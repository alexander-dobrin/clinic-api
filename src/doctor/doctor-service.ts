import { v4 } from 'uuid';
import { DoctorModel } from './doctor-model';
import { CreateDoctorDto } from './dto/create-doctor-dto';
import { plainToClass } from 'class-transformer';
import { UpdateDoctorDto } from './dto/update-doctor-dto';
import { merge } from 'lodash';
import { DateTime } from 'luxon';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { IQueryParams, IRepository } from '../common/types';
import { HttpError } from '../common/errors';
import { ErrorMessageEnum, StatusCodeEnum } from '../common/enums';
import { DoctorQueryHandler } from './helpers/doctor-query-handler';
import { AppointmentRepository } from '../appointment/appointment-repository';
import { validDto, validateDto } from '../common/decorator';

@injectable()
export class DoctorService {
	constructor(
		@inject(CONTAINER_TYPES.DOCTORS_REPOSITORY)
		private readonly doctorsRepository: IRepository<DoctorModel>,
		@inject(CONTAINER_TYPES.APPOINTMENTS_REPOSITORY)
		private readonly appointmentsRepository: AppointmentRepository,
	) {}

	@validateDto
	public async createDoctor(
		@validDto(CreateDoctorDto) doctorDto: CreateDoctorDto,
	): Promise<DoctorModel> {
		const doctor = plainToClass(DoctorModel, { id: v4(), ...doctorDto });
		return this.doctorsRepository.add(doctor);
	}

	public async read(options: IQueryParams): Promise<DoctorModel[]> {
		const objects = await this.doctorsRepository.getAll();
		const doctors = objects.map((d) => plainToClass(DoctorModel, d));

		return new DoctorQueryHandler(this.appointmentsRepository).applyRequestQuery(doctors, options);
	}

	public async getById(id: string): Promise<DoctorModel | undefined> {
		const doctor = plainToClass(DoctorModel, await this.doctorsRepository.get(id));
		return doctor;
	}

	@validateDto
	public async update(
		id: string,
		@validDto(UpdateDoctorDto) doctorDto: UpdateDoctorDto,
	): Promise<DoctorModel | undefined> {
		const doctor = await this.getById(id);

		if (!doctor) {
			return;
		}
		merge(doctor, doctorDto);

		return this.doctorsRepository.update(doctor);
	}

	public async delete(id: string): Promise<DoctorModel | undefined> {
		const doctor = await this.getById(id);
		if (!doctor) {
			return;
		}

		const deletedDoctor = await this.doctorsRepository.remove(doctor);
		if (deletedDoctor) {
			this.appointmentsRepository.removeAllDoctorAppointments(deletedDoctor.id);
		}

		return deletedDoctor;
	}

	public async takeFreeSlot(id: string, date: DateTime): Promise<boolean> {
		const doctor = await this.getById(id);
		if (!doctor) {
			return false;
		}
		const freeSlotIdx = doctor.availableSlots.findIndex((s) => s.equals(date.toUTC()));
		if (freeSlotIdx < 0) {
			throw new HttpError(
				StatusCodeEnum.CONFLICT,
				`Doctor [${id}] is unavailable at [${date.toISO()}]`,
			);
		}
		doctor.availableSlots.splice(freeSlotIdx, 1);
		this.doctorsRepository.update(doctor);
		return true;
	}

	public async isExists(id: string): Promise<boolean> {
		return (await this.getById(id)) ? true : false;
	}
}

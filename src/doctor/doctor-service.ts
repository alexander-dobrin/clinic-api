import { v4 } from 'uuid';
import { DoctorModel } from './doctor-model';
import { CreateDoctorDto } from './dto/create-doctor-dto';
import { plainToClass } from 'class-transformer';
import { UpdateDoctorDto } from './dto/update-doctor-dto';
import { merge } from 'lodash';
import { DateTime } from 'luxon';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { IDataProvider, IQueryParams, IRepository } from '../common/types';
import { HttpError } from '../common/errors';
import { StatusCodeEnum } from '../common/enums';
import { DoctorQueryHelper } from './helpers/doctor-query-helper';
import { AppointmentRepository } from '../appointment/appointment-repository';
import { validDto, validateDto } from '../common/decorator';
import { UserPayload } from '../auth/auth-types';
import { IUser } from '../user/user-interface';

@injectable()
export class DoctorService {
	constructor(
		@inject(CONTAINER_TYPES.DOCTORS_REPOSITORY)
		private readonly doctorsRepository: IRepository<DoctorModel>,
		@inject(CONTAINER_TYPES.APPOINTMENTS_REPOSITORY)
		private readonly appointmentsRepository: AppointmentRepository,
		@inject(CONTAINER_TYPES.USER_DATA_PROVIDER) private readonly userProvider: IDataProvider<IUser>,
	) {}

	@validateDto
	public async createDoctor(
		@validDto(CreateDoctorDto) doctorDto: CreateDoctorDto,
		user: UserPayload,
	): Promise<DoctorModel> {
		const doctorUser = await this.userProvider.readById(user.id);
		if (!doctorUser) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `User [${user.id}] not found`);
		}
		const doctor = plainToClass(DoctorModel, { id: v4(), userId: doctorUser.id, ...doctorDto });
		return this.doctorsRepository.add(doctor);
	}

	public async read(options: IQueryParams): Promise<DoctorModel[]> {
		const objects = await this.doctorsRepository.getAll();
		const doctors = objects.map((d) => plainToClass(DoctorModel, d));

		return new DoctorQueryHelper(this.appointmentsRepository).applyRequestQuery(doctors, options);
	}

	public async getById(id: string): Promise<DoctorModel | undefined> {
		const foundDoctor = await this.doctorsRepository.get(id);
		if (!foundDoctor) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `Doctor [${id}] not found`);
		}
		const doctor = plainToClass(DoctorModel, foundDoctor);
		return doctor;
	}

	@validateDto
	public async update(
		id: string,
		@validDto(UpdateDoctorDto) doctorDto: UpdateDoctorDto,
	): Promise<DoctorModel | undefined> {
		const doctor = await this.getById(id);
		merge(doctor, doctorDto);
		return this.doctorsRepository.update(doctor);
	}

	public async delete(id: string): Promise<DoctorModel | undefined> {
		const doctor = await this.getById(id);
		const deletedDoctor = await this.doctorsRepository.remove(doctor);
		if (deletedDoctor) {
			this.appointmentsRepository.removeAllDoctorAppointments(deletedDoctor.id);
		}
		return deletedDoctor;
	}

	public async takeFreeSlot(id: string, date: DateTime): Promise<void> {
		const doctor = await this.getById(id);
		const freeSlotIdx = doctor.availableSlots.findIndex((s) => s.equals(date.toUTC()));
		if (freeSlotIdx < 0) {
			throw new HttpError(
				StatusCodeEnum.CONFLICT,
				`Doctor [${id}] is unavailable at [${date.toISO()}]`,
			);
		}
		doctor.availableSlots.splice(freeSlotIdx, 1);
		this.doctorsRepository.update(doctor);
	}
}

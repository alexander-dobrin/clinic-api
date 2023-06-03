import { DoctorModel } from './doctor-model';
import { CreateDoctorDto } from './dto/create-doctor-dto';
import { UpdateDoctorDto } from './dto/update-doctor-dto';
import { DateTime } from 'luxon';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { GetOptions } from '../common/types';
import { HttpError } from '../common/errors';
import { StatusCodeEnum } from '../common/enums';
import { AppointmentRepository } from '../appointment/appointment-repository';
import { validDto, validateDto } from '../common/decorator';
import { UserPayload } from '../auth/auth-types';
import { DoctorRepository } from './doctor-repository';
import { UserRepository } from '../user/user-repository';
import { Repository } from '../common/utils';
import { QueryFailedError } from 'typeorm';

@injectable()
export class DoctorService {
	constructor(
		@inject(CONTAINER_TYPES.DOCTORS_REPOSITORY)
		private readonly doctorsRepository: DoctorRepository,
		// TODO: DELETE or AppointmentService
		@inject(CONTAINER_TYPES.APPOINTMENTS_REPOSITORY)
		private readonly appointmentsRepository: AppointmentRepository,
		// TODO: UserService?
		@inject(CONTAINER_TYPES.USER_REPOSITORY) private readonly userRepository: UserRepository,
	) {}

	@validateDto
	public async createDoctor(
		@validDto(CreateDoctorDto) doctorDto: CreateDoctorDto,
		user: UserPayload,
	): Promise<DoctorModel> {
		const doctorUser = await this.userRepository.findOneBy({ id: user.id });
		if (!doctorUser) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `User [${user.id}] not found`);
		}
		const doctor = new DoctorModel();
		doctor.availableSlots = doctorDto.availableSlots.map((s) =>
			DateTime.fromISO(s, { zone: 'utc' }),
		);
		doctor.speciality = doctorDto.speciality;
		doctor.userId = user.id;
		return this.doctorsRepository.save(doctor);
	}

	public async read(options: GetOptions): Promise<DoctorModel[]> {
		return Repository.findMatchingOptions(this.doctorsRepository, options);
	}

	public async getById(id: string): Promise<DoctorModel | null> {
		try {
			const doctor = await this.doctorsRepository.findOneBy({ id });
			console.log(doctor);
			if (!doctor) {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Doctor [${id}] not found`);
			}
			return doctor;
		} catch (err) {
			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Doctor [${id}] not found`);
			}
			throw err;
		}
	}

	@validateDto
	public async update(
		id: string,
		@validDto(UpdateDoctorDto) doctorDto: UpdateDoctorDto,
	): Promise<DoctorModel | null> {
		const doctor = await this.getById(id);
		const { speciality = doctor.speciality } = doctorDto;
		if (doctorDto.availableSlots) {
			doctor.availableSlots = doctorDto.availableSlots.map((s) =>
				DateTime.fromISO(s, { zone: 'utc' }),
			);
		}
		doctor.speciality = speciality;
		return this.doctorsRepository.save(doctor);
	}

	public async delete(id: string): Promise<void> {
		try {
			const res = await this.doctorsRepository.delete(id);
			if (!res.affected) {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Doctor [${id}] not found`);
			}
			this.appointmentsRepository.removeAllDoctorAppointments(id);
		} catch (err) {
			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Patient [${id}] not found`);
			}
			throw err;
		}
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
		this.doctorsRepository.save(doctor);
	}
}

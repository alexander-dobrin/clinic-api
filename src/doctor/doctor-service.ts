import { Doctor } from './doctor';
import { CreateDoctorDto } from './dto/create-doctor-dto';
import { UpdateDoctorDto } from './dto/update-doctor-dto';
import { DateTime } from 'luxon';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { GetOptions } from '../common/types';
import { HttpError } from '../common/errors';
import { StatusCodeEnum } from '../common/enums';
import { validDto, validateDto } from '../common/decorator/validate-dto';
import { UserPayload } from '../auth/auth-types';
import { DoctorRepository } from './doctor-repository';
import { RepositoryUtils } from '../common/util/repository-utils';
import { QueryFailedError } from 'typeorm';
import { UserService } from '../user/user-service';

@injectable()
export class DoctorService {
	constructor(
		@inject(CONTAINER_TYPES.DOCTORS_REPOSITORY)
		private readonly doctorsRepository: DoctorRepository,
		@inject(CONTAINER_TYPES.USER_SERVICE) private readonly userService: UserService,
	) {}

	@validateDto
	public async createDoctor(
		@validDto(CreateDoctorDto) doctorDto: CreateDoctorDto,
		user: UserPayload,
	): Promise<Doctor> {
		const doctorUser = await this.userService.getById(user.id);
		const doctor = new Doctor();
		doctor.availableSlots = doctorDto.availableSlots.map((s) =>
			DateTime.fromISO(s, { zone: 'utc' }),
		);
		doctor.speciality = doctorDto.speciality;
		doctor.userId = doctorUser.id;
		return this.doctorsRepository.save(doctor);
	}

	public async read(options: GetOptions): Promise<Doctor[]> {
		return RepositoryUtils.findMatchingOptions(this.doctorsRepository, options);
	}

	public async getById(id: string): Promise<Doctor | null> {
		try {
			const doctor = await this.doctorsRepository.findOneBy({ id });
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
	): Promise<Doctor | null> {
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

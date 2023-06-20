import { Doctor } from './doctor';
import { CreateDoctorDto } from './dto/create-doctor-dto';
import { UpdateDoctorDto } from './dto/update-doctor-dto';
import { DateTime } from 'luxon';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { GetOptions } from '../common/types';
import { HttpError } from '../common/errors';
import { ErrorMessageEnum, StatusCodeEnum } from '../common/enums';
import { validDto, validateDto } from '../common/decorator/validate-dto';
import { UserPayload } from '../auth/auth-types';
import { DoctorRepository } from './doctor-repository';
import { RepositoryUtils } from '../common/util/repository-utils';
import { EntityManager, EntityNotFoundError, QueryFailedError } from 'typeorm';
import { UserService } from '../user/user-service';

@injectable()
export class DoctorService {
	constructor(
		@inject(CONTAINER_TYPES.DOCTOR_REPOSITORY)
		private readonly doctorRepository: DoctorRepository,
		@inject(CONTAINER_TYPES.USER_SERVICE) private readonly userService: UserService,
	) {}

	@validateDto
	public async createDoctor(
		@validDto(CreateDoctorDto) doctorDto: CreateDoctorDto,
		user: UserPayload, // Review: если мы храним id пользователя в докторе то авторизация обязательна для создания?
	): Promise<Doctor> {
		const doctorUser = await this.userService.getById(user.id);
		const doctor = new Doctor();
		doctor.availableSlots = doctorDto.availableSlots.map((s) =>
			DateTime.fromISO(s, { zone: 'utc' }),
		);
		doctor.speciality = doctorDto.speciality;
		doctor.userId = doctorUser.id;
		return this.doctorRepository.save(doctor);
	}

	public async get(options: GetOptions): Promise<Doctor[]> {
		if (this.isAppointmentsOption(options)) {
			return this.doctorRepository.getOrderedByAppointmentsCount(options);
		}
		return RepositoryUtils.findMatchingOptions(this.doctorRepository, options);
	}

	private isAppointmentsOption(options: GetOptions) {
		try {
			return options.sort != undefined && Object.keys(options.sort).includes('appointments');
		} catch (err) {
			// Review: typerom бросает исключение если id не в верном формате.
			// Стоит ли мне самому проверять что id в нужном формате и бросать свое исключение
			// Или допустить в логике неверный id и позволить typeorm выбросить исключение?
			// Как в таком случае принято различать исключения которые бросает библиотека?
			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				throw new HttpError(StatusCodeEnum.BAD_REQUEST, ErrorMessageEnum.UNKNOWN_QUERY_PARAMETER);
			}
			throw err;
		}
	}

	public async getById(id: string): Promise<Doctor | null> {
		try {
			const doctor = await this.doctorRepository.findOneByOrFail({ id });
			return doctor;
		} catch (err) {
			if (err instanceof EntityNotFoundError) {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Doctor [${id}] not found`);
			}
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
		return this.doctorRepository.save(doctor);
	}

	public async delete(id: string): Promise<void> {
		try {
			const res = await this.doctorRepository.delete(id);
			if (!res.affected) {
				throw new HttpError(StatusCodeEnum.CONFLICT, `Doctor [${id}] might be allready deleted`);
			}
		} catch (err) {
			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Doctor [${id}] not found`);
			}
			throw err;
		}
	}

	public async takeFreeSlot(
		id: string,
		date: DateTime,
		transaction?: EntityManager,
	): Promise<void> {
		const doctor = await this.getById(id);
		const freeSlotIdx = doctor.availableSlots.findIndex((s) => s.equals(date.toUTC()));
		if (freeSlotIdx < 0) {
			throw new HttpError(
				StatusCodeEnum.CONFLICT,
				`Doctor [${id}] is unavailable at [${date.toISO()}]`,
			);
		}
		doctor.availableSlots.splice(freeSlotIdx, 1);
		if (transaction) {
			transaction.save(doctor);
		} else {
			this.doctorRepository.save(doctor);
		}
	}
}

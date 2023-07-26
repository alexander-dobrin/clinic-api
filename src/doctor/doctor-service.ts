import { Doctor } from './doctor';
import { CreateDoctorDto } from './dto/create-doctor-dto';
import { UpdateDoctorDto } from './dto/update-doctor-dto';
import { DateTime } from 'luxon';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { GetOptions } from '../common/types';
import { HttpError } from '../common/errors';
import { StatusCodeEnum, UserRoleEnum } from '../common/enums';
import { validDto, validateDto } from '../common/decorator/validate-dto';
import { UserPayload } from '../auth/auth-types';
import { DataSource, EntityManager, QueryFailedError, Repository } from 'typeorm';
import { UserService } from '../user/user-service';
import { Appointment } from '../appointment/appointment';

@injectable()
export class DoctorService {
	private readonly doctorRepository: Repository<Doctor>;
	
	constructor(
		@inject(CONTAINER_TYPES.DB_CONNECTION) private readonly dataSource: DataSource,
		@inject(CONTAINER_TYPES.USER_SERVICE) private readonly userService: UserService,
	) {
		this.doctorRepository = dataSource.getRepository(Doctor);
	}

	@validateDto
	public async createDoctor(
		@validDto(CreateDoctorDto) doctorDto: CreateDoctorDto,
		user: UserPayload,
	): Promise<Doctor> {
		const doctorUser = await this.userService.getById(user.id);
		const doctor = this.doctorRepository.create({
			availableSlots: doctorDto.availableSlots.map((s) => DateTime.fromISO(s, { zone: 'utc' })),
			user: doctorUser, // TODO: ASK
			speciality: doctorDto.speciality,
		});

		return this.doctorRepository.save(doctor);
	}

	public async get(options: GetOptions): Promise<Doctor[]> {
		const shouldCountAppointments =
			options.sort != undefined && Object.keys(options.sort).includes('appointments');
		if (!shouldCountAppointments) {
			return this.doctorRepository.find({
				where: options.filter,
				order: options.sort ?? { createdAt: 'DESC' },
			});
		}

		const builder = await this.dataSource.manager
			.createQueryBuilder(Doctor, 'doctor')
			.select(
				(subQuery) =>
					subQuery
						.select('COUNT(appointment_id)', 'appointments_count')
						.from(Appointment, 'appointment')
						.where('appointment.doctorId = doctor.doctor_id'),
				'appointments_count',
			)
			.orderBy(
				'appointments_count',
				options.sort['appointments'] === '' ? 'DESC' : options.sort['appointments'].toUpperCase(),
			);

		if (options.filter) {
			builder.where(options.filter);
		}

		const sortParams = Object.entries(options.sort).filter(([key]) => key !== 'appointments');

		sortParams.forEach(([key, value]) => {
			builder.addOrderBy(key, value.toUpperCase());
		});

		return builder.getMany();
	}

	public async getById(id: string): Promise<Doctor | null> {
		const doctor = await this.doctorRepository.findOneByOrFail({ id });
		return doctor;
	}

	// Review обсудить добавление отдельного метода
	public async getByIdRestrictedToOwnData(id: string, user: UserPayload) {
		if (user.role === UserRoleEnum.DOCTOR) {
			const userDoctors = await this.doctorRepository.findOne({
				where: { user: { id: user.id } },
				relations: { user: true },
				// TODO select: {} 
			});
			if (!userDoctors) {
				throw new HttpError(StatusCodeEnum.FORBIDDEN, 'Forbidden');
			}
		}
		return this.getById(id);
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

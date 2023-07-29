import { Patient } from './patient';
import { HttpError } from '../common/errors';
import { CreatePatientDto } from './dto/create-patient-dto';
import { UpdatePatientDto } from './dto/update-patient-dto';
import { ErrorMessageEnum, StatusCodeEnum } from '../common/enums';
import { injectable, inject } from 'inversify';
import { GetOptions } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import { UserPayload } from '../auth/auth-types';
import { validDto, validateDto } from '../common/decorator/validate-dto';
import { DataSource, EntityManager, EntityNotFoundError, QueryFailedError, Repository } from 'typeorm';
import { UserService } from '../user/user-service';

@injectable()
export class PatientService {
	private readonly patientRepository: Repository<Patient>;

	constructor(
		@inject(CONTAINER_TYPES.DB_CONNECTION) private readonly dataSource: DataSource,
		@inject(CONTAINER_TYPES.USER_SERVICE) private readonly userService: UserService,
	) {
		this.patientRepository = dataSource.getRepository(Patient);
	}

	@validateDto
	public async create(
		@validDto(CreatePatientDto) patientDto: CreatePatientDto,
		user: UserPayload,
		transaction?: EntityManager
	): Promise<Patient> {
		await this.throwIfPhoneTaken(patientDto.phoneNumber);

		if (transaction) {
			return transaction.save(new Patient(user.id, patientDto.phoneNumber));
		}

		const patientUser = await this.userService.getById(user.id);
		const patient = new Patient(patientUser.id, patientDto.phoneNumber);
				
		return this.patientRepository.save(patient);
	}

	public async get(options: GetOptions): Promise<Patient[]> {
		try {
			return this.patientRepository.find({
				where: options.filter,
				order: options.sort ?? { createdAt: 'DESC' },
			});
		} catch (err) {
			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				throw new HttpError(StatusCodeEnum.BAD_REQUEST, ErrorMessageEnum.UNKNOWN_QUERY_PARAMETER);
			}
			throw err;
		}
	}

	public async getById(id: string): Promise<Patient | undefined> {
		try {
			const patient = await this.dataSource.manager
				.createQueryBuilder(Patient, 'patient')
				.where('patient.id = :id', { id })
				.addSelect(['patient.createdAt'])
				.getOneOrFail();

			return patient;
		} catch (err) {
			if (err instanceof EntityNotFoundError) {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Patient [${id}] not found`);
			}

			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Patient [${id}] not found`);
			}
			throw err;
		}
	}

	@validateDto
	public async update(
		id: string,
		@validDto(UpdatePatientDto) patientDto: UpdatePatientDto,
	): Promise<Patient> {
		if (patientDto.phoneNumber) {
			await this.throwIfPhoneTaken(patientDto.phoneNumber);
		}

		const patient = await this.getById(id);
		const { phoneNumber = patient.phoneNumber } = patientDto;
		patient.phoneNumber = phoneNumber;

		return this.patientRepository.save(patient);
	}

	public async delete(id: string): Promise<void> {
		try {
			await this.patientRepository.delete(id);
		} catch (err) {
			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				return;
			}
			throw err;
		}
	}

	private async throwIfPhoneTaken(phone: string) {
		const isTaken = await this.patientRepository.findOneBy({ phoneNumber: phone });
		if (isTaken) {
			throw new HttpError(StatusCodeEnum.BAD_REQUEST, `Phone [${phone}] is already in use`);
		}
	}
}

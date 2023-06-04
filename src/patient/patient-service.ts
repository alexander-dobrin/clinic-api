import { PatientModel } from './patient-model';
import { HttpError } from '../common/errors';
import { CreatePatientDto } from './dto/create-patient-dto';
import { UpdatePatientDto } from './dto/update-patient-dto';
import { StatusCodeEnum } from '../common/enums';
import { injectable, inject } from 'inversify';
import { GetOptions } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import { UserPayload } from '../auth/auth-types';
import { validDto, validateDto } from '../common/decorator';
import { UserRepository } from '../user/user-repository';
import { PatientRepository } from './patient-repository';
import { Repository } from '../common/utils';
import { QueryFailedError } from 'typeorm';

@injectable()
export class PatientService {
	constructor(
		@inject(CONTAINER_TYPES.PATIENTS_REPOSITORY)
		private readonly patientRepository: PatientRepository,
		// TODO: USE SERVICE?
		@inject(CONTAINER_TYPES.USER_REPOSITORY) private readonly userRepository: UserRepository,
	) {}

	@validateDto
	public async create(
		@validDto(CreatePatientDto) patientDto: CreatePatientDto,
		user: UserPayload,
	): Promise<PatientModel> {
		await this.throwIfPhoneTaken(patientDto.phoneNumber);
		const patientUser = await this.userRepository.findOneBy({ id: user.id });
		if (!patientUser) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `User [${user.id}] not found`);
		}
		const patient = new PatientModel(user.id, patientDto.phoneNumber);
		return this.patientRepository.save(patient);
	}

	public async get(options: GetOptions): Promise<PatientModel[]> {
		return Repository.findMatchingOptions(this.patientRepository, options);
	}

	public async getById(id: string): Promise<PatientModel | undefined> {
		try {
			const patient = await this.patientRepository.findOneBy({ id });
			if (!patient) {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Patient [${id}] not found`);
			}
			return patient;
		} catch (err) {
			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `User [${id}] not found`);
			}
			throw err;
		}
	}

	@validateDto
	public async updatePatientById(
		id: string,
		@validDto(UpdatePatientDto) patientDto: UpdatePatientDto,
	): Promise<PatientModel> {
		if (patientDto.phoneNumber) {
			await this.throwIfPhoneTaken(patientDto.phoneNumber);
		}
		const patient = await this.getById(id);
		const { phoneNumber = patient.phoneNumber } = patientDto;

		patient.phoneNumber = phoneNumber;

		return this.patientRepository.save(patient);
	}

	public async deletePatientById(id: string): Promise<void> {
		try {
			const res = await this.patientRepository.delete(id);
			if (!res.affected) {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Patient [${id}] not found`);
			}
		} catch (err) {
			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `Patient [${id}] not found`);
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

	// Review TODO: IS NEEDED
	public async isExists(id: string): Promise<boolean> {
		try {
			const patient = await this.patientRepository.findOneBy({ id });
			if (!patient) {
				return false;
			}
			return true;
		} catch (err) {
			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				return false;
			}
			throw err;
		}
	}
}

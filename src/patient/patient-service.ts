import { PatientModel } from './patient-model';
import { HttpError } from '../common/errors';
import { CreatePatientDto } from './dto/create-patient-dto';
import { v4 } from 'uuid';
import { UpdatePatientDto } from './dto/update-patient-dto';
import {
	ErrorMessageEnum,
	PatietnsFilterByEnum,
	StatusCodeEnum,
	UserRoleEnum,
} from '../common/enums';
import { injectable, inject } from 'inversify';
import { IDataProvider, IFilterParam, IQueryParams, IRepository } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import { IUser } from '../user/user-interface';
import { UserPayload } from '../auth/auth-types';
import { validDto, validateDto } from '../common/decorator';

@injectable()
export class PatientService {
	constructor(
		@inject(CONTAINER_TYPES.PATIENTS_REPOSITORY)
		private readonly repository: IRepository<PatientModel>,
		@inject(CONTAINER_TYPES.USER_DATA_PROVIDER) private readonly userProvider: IDataProvider<IUser>,
	) {}

	@validateDto
	public async create(
		@validDto(CreatePatientDto) patientDto: CreatePatientDto,
		user: UserPayload,
	): Promise<PatientModel> {
		await this.throwIfPhoneTaken(patientDto.phoneNumber);
		const patientUser = await this.userProvider.readById(user.id);
		if (!patientUser) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `User [${user.id}] not found`);
		}
		const patient = new PatientModel(v4(), patientUser, patientDto.phoneNumber);

		// Review: should assign role here?
		patientUser.role = UserRoleEnum.DOCTOR;
		this.userProvider.updateById(patientUser.id, patientUser);

		return await this.repository.add(patient);
	}

	public async read(options: IQueryParams): Promise<PatientModel[]> {
		if (options.filterBy) {
			return await this.filterPatients(options.filterBy);
		}
		return this.repository.getAll();
	}

	private async filterPatients(filterParams: IFilterParam[]): Promise<PatientModel[]> {
		let filtered = await this.repository.getAll();
		for (const param of filterParams) {
			param.field = param.field.toLowerCase();
			if (param.field === PatietnsFilterByEnum.NAME) {
				filtered = filtered.filter((p) => p.user.firstName === param.value);
			} else if (param.field === PatietnsFilterByEnum.PHONE) {
				filtered = filtered.filter((p) => p.phoneNumber === param.value);
			} else {
				throw new HttpError(
					StatusCodeEnum.BAD_REQUEST,
					ErrorMessageEnum.UNKNOWN_QUERY_PARAMETER.replace('%s', param.field),
				);
			}
		}
		return filtered;
	}

	public async readById(id: string): Promise<PatientModel | undefined> {
		const patient = await this.repository.get(id);
		if (!patient) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `Patient [${id}] not found`);
		}
		return patient;
	}

	@validateDto
	public async updatePatientById(
		id: string,
		@validDto(UpdatePatientDto) patientDto: UpdatePatientDto,
	): Promise<PatientModel> {
		if (patientDto.phoneNumber) {
			await this.throwIfPhoneTaken(patientDto.phoneNumber);
		}
		const patient = await this.readById(id);
		const { phoneNumber = patient.phoneNumber, firstName = patient.user.firstName } = patientDto;
		patient.phoneNumber = phoneNumber;

		// Review: should update user that straightforward way since patients user part was updated?
		patient.user.firstName = firstName;
		await this.userProvider.updateById(patient.user.id, patient.user);

		return await this.repository.update(patient);
	}

	public async deletePatientById(id: string): Promise<PatientModel> {
		const patient = await this.readById(id);
		return this.repository.remove(patient);
	}

	private async throwIfPhoneTaken(phone: string) {
		const patients = await this.repository.getAll();
		const isTaken = patients.some((p) => p.phoneNumber === phone);
		if (isTaken) {
			throw new HttpError(StatusCodeEnum.BAD_REQUEST, `Phone [${phone}] is already in use`);
		}
	}

	public async isExists(id: string): Promise<boolean> {
		return (await this.repository.get(id)) ? true : false;
	}
}

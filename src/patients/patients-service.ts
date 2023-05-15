import PatientModel from "./patient-model";
import { DuplicateEntityError, UnableToFilterError } from "../common/errors";
import CreatePatientDto from "./dto/create-patient-dto";
import { v4 } from "uuid";
import { merge } from "lodash";
import UpdatePatientDto from "./dto/update-patient-dto";
import { ErrorMessageEnum, PatietnsFilterByEnum, UserRoleEnum } from "../common/enums";
import { IPatientsService } from "./patients-service-interface";
import { injectable, inject } from 'inversify';

import { IDataProvider, IFilterParam, IQueryParams, IRepository } from "../common/types";
import { CONTAINER_TYPES } from "../common/constants";
import { IUser } from "../users/user-interface";
import { JwtPayload } from "jsonwebtoken";

@injectable()
export default class PatientsService implements IPatientsService {
    constructor(
        @inject(CONTAINER_TYPES.PATIENTS_REPOSITORY) private readonly repository: IRepository<PatientModel>,
        @inject(CONTAINER_TYPES.USER_DATA_PROVIDER) private readonly userProvider: IDataProvider<IUser>
    ) {

    }

    public async createPatient(patientDto: CreatePatientDto, user: JwtPayload): Promise<PatientModel> {
        await this.throwIfPhoneTaken(patientDto.phoneNumber);
        const patientUser = await this.userProvider.readById(user.id);
        const patient = new PatientModel(v4(), patientUser, patientDto.phoneNumber);

        // Review: should assign role here?
        patientUser.role = UserRoleEnum.DOCTOR;
        this.userProvider.updateById(patientUser.id, patientUser);

        return await this.repository.add(patient);
    }

    public async getAllPatients(options: IQueryParams): Promise<PatientModel[]> {
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
                filtered = this.filterByName(filtered, param.value);
            } else if (param.field === PatietnsFilterByEnum.PHONE) {
                filtered = this.filterByPhone(filtered, param.value);
            } else {
                throw new UnableToFilterError(ErrorMessageEnum.UNKNOWN_QUERY_PARAMETER.replace('%s', param.field));
            }
        }
        return filtered;
    }

    private filterByName(patients: PatientModel[], name: string): PatientModel[] {
        return patients.filter(p => p.user.firstName === name);
    }

    private filterByPhone(patients: PatientModel[], phone: string): PatientModel[] {
        return patients.filter(p => p.phoneNumber === phone);
    }

    public async getPatientById(id: string): Promise<PatientModel | undefined> {
        return this.repository.get(id);
    }

    public async updatePatientById(id: string, patientDto: UpdatePatientDto): Promise<PatientModel | undefined> {
        if (patientDto.phoneNumber) {
            await this.throwIfPhoneTaken(patientDto.phoneNumber);
        }

        const patient = await this.repository.get(id);
        if (!patient) {
            return;
        }        
        // Review: use merge or create new user manually with constructor
        merge(patient, patientDto);

        return await this.repository.update(patient);
    }

    public async deletePatientById(id: string): Promise<PatientModel | undefined> {
        const patient = await this.repository.get(id);
        if (!patient) {
            return;
        }

        return this.repository.remove(patient);;
    }

    private async throwIfPhoneTaken(phone: string) {
        const patients = await this.repository.getAll();
        const isTaken = patients.some(p => p.phoneNumber === phone);
        if (isTaken) {
            throw new DuplicateEntityError(ErrorMessageEnum.PHONE_IS_TAKEN.replace('%s', phone));
        }
    }

    public async isExists(id: string): Promise<boolean> {
        return (await this.repository.get(id)) ? true : false;
    }
}
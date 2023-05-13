import PatientModel from "./patient-model";
import { DuplicateEntityError, UnableToFilterError } from "../common/errors";
import CreatePatientDto from "./dto/create-patient-dto";
import { v4 } from "uuid";
import { merge } from "lodash";
import UpdatePatientDto from "./dto/update-patient-dto";
import { ErrorMessageEnum, PatietnsFilterByEnum } from "../common/enums";
import { IPatientsService } from "./patients-service-interface";
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { IFilterParam, IQueryParams, IRepository } from "../common/types";
import { CONTAINER_TYPES } from "../common/constants";

@injectable()
export default class PatientsService implements IPatientsService {
    constructor(
        @inject(CONTAINER_TYPES.PATIENTS_REPOSITORY) private readonly repository: IRepository<PatientModel>
    ) {

    }

    public async createPatient(patientDto: CreatePatientDto): Promise<PatientModel> {
        const { firstName, phoneNumber } = patientDto;

        await this.throwIfPhoneTaken(phoneNumber);
        const patient = new PatientModel(v4(), firstName, phoneNumber);
        
        return await this.repository.add(patient);
    }

    public async getAllPatients(options: IQueryParams): Promise<PatientModel[]> {
        let patients = await this.repository.getAll();
        if (options.filterBy) {
            patients = this.filterPatients(patients, options.filterBy);
        }
        return patients;
    }

    private filterPatients(patients: PatientModel[], filterParams: IFilterParam[]): PatientModel[] {
        let filtered = patients;
        for (const param of filterParams) {
            param.field = param.field.toLowerCase();
            if (param.field === PatietnsFilterByEnum.NAME) {
                filtered = this.filterByName(patients, param.value);
            } else if (param.field === PatietnsFilterByEnum.PHONE) {
                filtered = this.filterByPhone(patients, param.value);
            } else {
                throw new UnableToFilterError(ErrorMessageEnum.UNKNOWN_QUERY_PARAMETER.replace('%s', param.field));
            }
        }
        return filtered;
    }

    private filterByName(patients: PatientModel[], name: string): PatientModel[] {
        return patients.filter(p => p.firstName === name);
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
        merge(patient, patientDto);

        return await this.repository.update(patient);
    }

    public async deletePatientById(id: string): Promise<PatientModel | undefined> {
        const patient = await this.repository.get(id);
        if (!patient) {
            return;
        }

        return await this.repository.remove(patient);;
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
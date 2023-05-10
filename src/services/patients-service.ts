import PatientModel from "../models/patient-model";
import { DuplicateEntityError } from "../errors/duplicate-entity-error";
import CreatePatientDto from "../dto/patients/create-patient-dto";
import { v4 } from "uuid";
import { merge } from "lodash";
import UpdatePatientDto from "../dto/patients/update-patient-dto";
import { ErrorMessages } from "../enums/error-messages";
import { IPatientsService } from "./abstract/patients-service-interface";
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { IRepository } from "../repositories/repository-interface";
import { TYPES } from "../types";

@injectable()
export default class PatientsService implements IPatientsService {
    constructor(
        @inject(TYPES.PATIENTS_REPOSITORY) private readonly repository: IRepository<PatientModel>
    ) {

    }

    public async createPatient(patientDto: CreatePatientDto): Promise<PatientModel> {
        const { firstName, phoneNumber } = patientDto;

        await this.throwIfPhoneTaken(phoneNumber);
        const patient = new PatientModel(v4(), firstName, phoneNumber);
        
        return await this.repository.add(patient);
    }

    public async getAllPatients(): Promise<PatientModel[]> {
        return this.repository.getAll();
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
            throw new DuplicateEntityError(ErrorMessages.PHONE_IS_TAKEN.replace('%s', phone));
        }
    }
}
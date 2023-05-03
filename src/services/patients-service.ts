import PatientModel from "../entities/patient-model";
import { DuplicateEntityError } from "../exceptions/duplicate-entity-error";
import PatientsRepository from "../repositories/patients-repository";
import CreatePatientDto from "../dto/patients/create-patient-dto";
import { v4 } from "uuid";
import { merge } from "lodash";
import UpdatePatientDto from "../dto/patients/update-patient-dto";
import { ErrorMessages } from "../enums/error-messages";

export default class PatientsService {
    private readonly repository: PatientsRepository;

    constructor(repository: PatientsRepository) {
        this.repository = repository;
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
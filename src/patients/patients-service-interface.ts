import { IQueryParams } from "../common/types";
import CreatePatientDto from "./dto/create-patient-dto";
import UpdatePatientDto from "./dto/update-patient-dto";
import PatientModel from "./patient-model";

export interface IPatientsService {
    createPatient(patientDto: CreatePatientDto): Promise<PatientModel>;
    getAllPatients(options: IQueryParams): Promise<PatientModel[]>;
    getPatientById(id: string): Promise<PatientModel | undefined>;
    updatePatientById(id: string, patientDto: UpdatePatientDto): Promise<PatientModel | undefined>;
    deletePatientById(id: string): Promise<PatientModel | undefined>;
}
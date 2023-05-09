import CreatePatientDto from "../../dto/patients/create-patient-dto";
import UpdatePatientDto from "../../dto/patients/update-patient-dto";
import PatientModel from "../../models/patient-model";

export interface IPatientsService {
    createPatient(patientDto: CreatePatientDto): Promise<PatientModel>;
    getAllPatients(): Promise<PatientModel[]>;
    getPatientById(id: string): Promise<PatientModel | undefined>;
    updatePatientById(id: string, patientDto: UpdatePatientDto): Promise<PatientModel | undefined>;
    deletePatientById(id: string): Promise<PatientModel | undefined>;
}
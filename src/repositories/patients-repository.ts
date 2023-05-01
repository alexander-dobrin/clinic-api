import { PatientEntity } from '../entities/patient-entity';
import IDataProvider from '../providers/data-provider-interface';

export default class PatientsRepository {
    constructor(
        private readonly provider: IDataProvider<PatientEntity>
    ) {

    }

    public async add(patient: PatientEntity): Promise<PatientEntity> {
        return this.provider.create(patient);
    }

    public async getAll(): Promise<PatientEntity[]> {
        return this.provider.read();
    }

    public async get(id: string): Promise<PatientEntity | undefined> {
        return this.provider.readById(id);
    }

    public async update(patient: PatientEntity): Promise<PatientEntity | undefined> {
        return this.provider.updateById(patient.id, patient);
    }

    public async remove(patient: PatientEntity): Promise<PatientEntity | undefined> {
        return this.provider.deleteById(patient.id);
    }
}
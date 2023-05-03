import PatientModel from '../entities/patient-model';
import IDataProvider from '../providers/abstract/data-provider-interface';

export default class PatientsRepository {
    private readonly provider: IDataProvider<PatientModel>;

    constructor(provider: IDataProvider<PatientModel>) {
        this.provider = provider;
    }

    public async add(patient: PatientModel): Promise<PatientModel> {
        return this.provider.create(patient);
    }

    public async getAll(): Promise<PatientModel[]> {
        return this.provider.read();
    }

    public async get(id: string): Promise<PatientModel | undefined> {
        return this.provider.readById(id);
    }

    public async update(patient: PatientModel): Promise<PatientModel | undefined> {
        return this.provider.updateById(patient.id, patient);
    }

    public async remove(patient: PatientModel): Promise<PatientModel | undefined> {
        return this.provider.deleteById(patient.id);
    }
}
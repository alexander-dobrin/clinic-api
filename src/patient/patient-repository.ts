import PatientModel from './patient-model';
import { IDataProvider } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import { IRepository } from '../common/types';
import { injectable, inject } from 'inversify';


@injectable()
export default class PatientRepository implements IRepository<PatientModel> {
    constructor(
        @inject(CONTAINER_TYPES.PATIENTS_DATA_PROVIDER) private readonly provider: IDataProvider<PatientModel>
    ) {
        
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
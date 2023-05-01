import { DoctorEntity } from '../entities/doctor-entity';
import IDataProvider from '../providers/data-provider-interface';

export class DoctorsRepository {
    constructor(
        private readonly provider: IDataProvider<DoctorEntity>
    ) {

    }

    public async add(patient: DoctorEntity): Promise<DoctorEntity> {
        return this.provider.create(patient);
    }

    public async getAll(): Promise<DoctorEntity[]> {
        return this.provider.read();
    }

    public async get(id: string): Promise<DoctorEntity | undefined> {
        return this.provider.readById(id);
    }

    public async update(patient: DoctorEntity): Promise<DoctorEntity | undefined> {
        return this.provider.updateById(patient.id, patient);
    }

    public async remove(patient: DoctorEntity): Promise<DoctorEntity | undefined> {
        return this.provider.deleteById(patient.id);
    }
}
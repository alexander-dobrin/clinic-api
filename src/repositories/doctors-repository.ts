import { DoctorEntity } from '../entities/doctor-entity';
import IDataProvider from '../providers/abstract/data-provider-interface';

export default class DoctorsRepository {
    constructor(
        private readonly provider: IDataProvider<DoctorEntity>
    ) {

    }

    public async add(doctor: DoctorEntity): Promise<DoctorEntity> {
        return this.provider.create(doctor);
    }

    public async getAll(): Promise<DoctorEntity[]> {
        return this.provider.read();
    }

    public async get(id: string): Promise<DoctorEntity | undefined> {
        return this.provider.readById(id);
    }

    public async update(doctor: DoctorEntity): Promise<DoctorEntity | undefined> {
        return this.provider.updateById(doctor.id, doctor);
    }

    public async remove(doctor: DoctorEntity): Promise<DoctorEntity | undefined> {
        return this.provider.deleteById(doctor.id);
    }
}
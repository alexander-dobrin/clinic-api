import { AppointmentEntity } from '../entities/appointment-entity';
import IDataProvider from '../providers/data-provider-interface';

export class AppointmentsRepository {
    constructor(
        private readonly provider: IDataProvider<AppointmentEntity>
    ) {

    }

    public async add(patient: AppointmentEntity): Promise<AppointmentEntity> {
        return this.provider.create(patient);
    }

    public async getAll(): Promise<AppointmentEntity[]> {
        return this.provider.read();
    }

    public async get(id: string): Promise<AppointmentEntity | undefined> {
        return this.provider.readById(id);
    }

    public async update(patient: AppointmentEntity): Promise<AppointmentEntity | undefined> {
        return this.provider.updateById(patient.id, patient);
    }

    public async remove(patient: AppointmentEntity): Promise<AppointmentEntity | undefined> {
        return this.provider.deleteById(patient.id);
    }
}
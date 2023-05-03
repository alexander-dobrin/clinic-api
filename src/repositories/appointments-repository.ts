import { AppointmentEntity } from '../entities/appointment-entity';
import IDataProvider from '../providers/abstract/data-provider-interface';

export default class AppointmentsRepository {
    constructor(
        private readonly provider: IDataProvider<AppointmentEntity>
    ) {

    }

    public async add(appointment: AppointmentEntity): Promise<AppointmentEntity> {
        return this.provider.create(appointment);
    }

    public async getAll(): Promise<AppointmentEntity[]> {
        return this.provider.read();
    }

    public async get(id: string): Promise<AppointmentEntity | undefined> {
        return this.provider.readById(id);
    }

    public async update(appointment: AppointmentEntity): Promise<AppointmentEntity | undefined> {
        return this.provider.updateById(appointment.id, appointment);
    }

    public async remove(appointment: AppointmentEntity): Promise<AppointmentEntity | undefined> {
        return this.provider.deleteById(appointment.id);
    }
}
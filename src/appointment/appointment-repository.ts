import AppointmentModel from './appointment-model';
import { IDataProvider } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import { IRepository } from '../common/types';
import { injectable, inject } from 'inversify';


@injectable()
export default class AppointmentRepository implements IRepository<AppointmentModel> {
    constructor(
        @inject(CONTAINER_TYPES.APPOINTMENTS_DATA_PROVIDER) private readonly provider: IDataProvider<AppointmentModel>
    ) {
        this.provider = provider;
    }

    public async add(appointment: AppointmentModel): Promise<AppointmentModel> {
        return this.provider.create(appointment);
    }

    public async getAll(): Promise<AppointmentModel[]> {
        return this.provider.read();
    }

    public async get(id: string): Promise<AppointmentModel | undefined> {
        return this.provider.readById(id);
    }

    public async update(appointment: AppointmentModel): Promise<AppointmentModel | undefined> {
        return this.provider.updateById(appointment.id, appointment);
    }

    public async remove(appointment: AppointmentModel): Promise<AppointmentModel | undefined> {
        return this.provider.deleteById(appointment.id);
    }

    public async removeAllDoctorAppointments(id: string): Promise<void> {
        const appointments = await this.getAll();
        const doctorAppointments = appointments.filter(a => a.doctorId === id);
        const promises = doctorAppointments.map(a => this.provider.deleteById(a.id));
        await Promise.all(promises);
    }
}
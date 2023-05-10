import AppointmentModel from '../models/appointment-model';
import IDataProvider from '../providers/abstract/data-provider-interface';
import { TYPES } from '../types';
import { IRepository } from './repository-interface';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';

@injectable()
export default class AppointmentsRepository implements IRepository<AppointmentModel> {
    constructor(
        @inject(TYPES.APPOINTMENTS_DATA_PROVIDER) private readonly provider: IDataProvider<AppointmentModel>
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
}
import DoctorModel from '../models/doctor-model';
import IDataProvider from '../providers/abstract/data-provider-interface';
import { TYPES } from '../types';
import { IRepository } from './repository-interface';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';

@injectable()
export default class DoctorsRepository implements IRepository<DoctorModel> {
    constructor(
        @inject(TYPES.DOCTORS_DATA_PROVIDER) private readonly provider: IDataProvider<DoctorModel>
    ) {

    }

    public async add(doctor: DoctorModel): Promise<DoctorModel> {
        return this.provider.create(doctor);
    }

    public async getAll(): Promise<DoctorModel[]> {
        return this.provider.read();
    }

    public async get(id: string): Promise<DoctorModel | undefined> {
        return this.provider.readById(id);
    }

    public async update(doctor: DoctorModel): Promise<DoctorModel | undefined> {
        return this.provider.updateById(doctor.id, doctor);
    }

    public async remove(doctor: DoctorModel): Promise<DoctorModel | undefined> {
        return this.provider.deleteById(doctor.id);
    }
}
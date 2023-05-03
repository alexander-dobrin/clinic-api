import DoctorModel from '../entities/doctor-model';
import IDataProvider from '../providers/abstract/data-provider-interface';

export default class DoctorsRepository {
    constructor(
        private readonly provider: IDataProvider<DoctorModel>
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
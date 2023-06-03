import { DoctorModel } from './doctor-model';
import { DataSource, Repository } from 'typeorm';

export class DoctorRepository extends Repository<DoctorModel> {
	constructor(provider: DataSource) {
		super(DoctorModel, provider.createEntityManager());
	}
}

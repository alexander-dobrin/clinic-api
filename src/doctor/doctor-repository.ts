import { Doctor } from './doctor';
import { DataSource, Repository } from 'typeorm';

export class DoctorRepository extends Repository<Doctor> {
	constructor(provider: DataSource) {
		super(Doctor, provider.createEntityManager());
	}
}

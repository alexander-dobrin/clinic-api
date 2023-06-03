import { PatientModel } from './patient-model';
import { DataSource, Repository } from 'typeorm';

export class PatientRepository extends Repository<PatientModel> {
	constructor(provider: DataSource) {
		super(PatientModel, provider.createEntityManager());
	}
}

import { Patient } from './patient';
import { DataSource, Repository } from 'typeorm';

export class PatientRepository extends Repository<Patient> {
	constructor(provider: DataSource) {
		super(Patient, provider.createEntityManager());
	}
}

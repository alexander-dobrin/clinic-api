import { PatientModel } from './patient-model';
import { CONTAINER_TYPES } from '../common/constants';
import { injectable, inject } from 'inversify';
import { DataSource, Repository } from 'typeorm';

@injectable()
export class PatientRepository extends Repository<PatientModel> {
	constructor(@inject(CONTAINER_TYPES.DB_CONNECTION) provider: DataSource) {
		super(PatientModel, provider.createEntityManager());
	}
}

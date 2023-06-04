import { AppointmentModel } from './appointment-model';
import { DataSource, Repository } from 'typeorm';

export class AppointmentRepository extends Repository<AppointmentModel> {
	constructor(provider: DataSource) {
		super(AppointmentModel, provider.createEntityManager());
	}
}

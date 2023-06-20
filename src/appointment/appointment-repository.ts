import { Appointment } from './appointment';
import { DataSource, Repository } from 'typeorm';

export class AppointmentRepository extends Repository<Appointment> {
	constructor(provider: DataSource) {
		super(Appointment, provider.createEntityManager());
	}
}

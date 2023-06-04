import { AppointmentModel } from './appointment-model';
import { DataSource, Repository } from 'typeorm';

export class AppointmentRepository extends Repository<AppointmentModel> {
	constructor(provider: DataSource) {
		super(AppointmentModel, provider.createEntityManager());
	}

	// TODO: CHECK IF WITHOT THIS METHOD EVERYTHING WORKS
	// public async removeAllDoctorAppointments(id: string): Promise<void> {
	// 	const appointments = await this.getAll();
	// 	const doctorAppointments = appointments.filter((a) => a.doctorId === id);
	// 	const promises = doctorAppointments.map((a) => this.provider.deleteById(a.id));
	// 	await Promise.all(promises);
	// }
}

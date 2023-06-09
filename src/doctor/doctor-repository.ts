import { Appointment } from '../appointment/appointment';
import { GetOptions } from '../common/types';
import { Doctor } from './doctor';
import { DataSource, Repository } from 'typeorm';

export class DoctorRepository extends Repository<Doctor> {
	constructor(provider: DataSource) {
		super(Doctor, provider.createEntityManager());
	}

	public async getOrderedByAppointmentsCount(extraOptions?: GetOptions) {
		// Review: 1. Join tables using query or using mapping in buisiness logic? 
		// 2. getMany vs getRawMany for returning composite result?
		const builder = this.createQueryBuilder('doctor')
			.addSelect((subQuery) => {
				return subQuery
					.select('COUNT(appointment_id)', 'appointments_count')
					.from(Appointment, 'appointment')
					.where('appointment.doctorId = doctor.doctor_id');
			}, 'appointments_count')
			.orderBy(
				'appointments_count',
				extraOptions.sort['appointments'] === ''
					? 'DESC'
					: extraOptions.sort['appointments'].toUpperCase(),
			);

		if (extraOptions.filter) {
			builder.where(extraOptions.filter);
		}
		const sortParams = Object.entries(extraOptions.sort).filter(([key]) => key !== 'appointments');
		sortParams.forEach(([key, value]) => {
			builder.addOrderBy(key, value.toUpperCase());
		});

		return builder.getMany();
	}
}

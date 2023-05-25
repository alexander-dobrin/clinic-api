import { AppointmentModel } from '../../../appointment/appointment-model';
import { ISortingStrategy } from '../../../common/types';
import { DoctorModel } from '../../doctor-model';

export class SortByAppointmentsStrategy implements ISortingStrategy {
	constructor(private readonly appointments: AppointmentModel[]) {}

	public sortDescening(doctors: DoctorModel[]): DoctorModel[] {
		const doctorsAppointmentsCount = this.appointments.reduce((acc, appointment) => {
			acc.set(appointment.doctorId, (acc.get(appointment.doctorId) || 0) + 1);
			return acc;
		}, new Map<string, number>());
		const sorted = doctors.sort((a, b) => {
			const aCount = doctorsAppointmentsCount.get(a.id) ?? 0;
			const bCount = doctorsAppointmentsCount.get(b.id) ?? 0;
			return bCount - aCount;
		});
		return sorted;
	}
}

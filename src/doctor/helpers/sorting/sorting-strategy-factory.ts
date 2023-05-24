import { AppointmentModel } from '../../../appointment/appointment-model';
import { DoctorsSortByEnum, ErrorMessageEnum, StatusCodeEnum } from '../../../common/enums';
import { HttpError } from '../../../common/errors';
import { IRepository, ISortingStrategy } from '../../../common/types';
import { SortByAppointmentsStrategy } from './sort-by-appointments-strategy';
import { SortByNameStrategy } from './sort-by-name-strategy';

export class SortingStrategyFactory {
	constructor(private readonly appointmentsRepository: IRepository<AppointmentModel>) {}

	public async create(sortBy: DoctorsSortByEnum): Promise<ISortingStrategy> {
		switch (sortBy.toLowerCase()) {
			case DoctorsSortByEnum.NAME:
				return new SortByNameStrategy();
			case DoctorsSortByEnum.APPOINTMENTS: {
				const appointments = await this.getAppointments();
				return new SortByAppointmentsStrategy(appointments);
			}
			default:
				throw new HttpError(
					StatusCodeEnum.BAD_REQUEST,
					ErrorMessageEnum.UNKNOWN_QUERY_PARAMETER.replace('%s', sortBy),
				);
		}
	}

	private async getAppointments() {
		const appointments = await this.appointmentsRepository.getAll();
		if (appointments.length < 1) {
			throw new HttpError(
				StatusCodeEnum.BAD_REQUEST,
				`Unable to process sorting based on [${DoctorsSortByEnum.APPOINTMENTS}] data as it is currently empty`,
			);
		}
		return appointments;
	}
}

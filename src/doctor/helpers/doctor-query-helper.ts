import { DoctorsSortByEnum, ErrorMessageEnum, StatusCodeEnum } from '../../common/enums';
import { HttpError } from '../../common/errors';
import { IFilterParam, IQueryParams, IRepository, ISortParam } from '../../common/types';
import { DoctorModel } from '../doctor-model';
import { AppointmentModel } from '../../appointment/appointment-model';

export class DoctorQueryHelper {
	constructor(private readonly appointmentsRepository: IRepository<AppointmentModel>) {}

	public async applyRequestQuery(
		doctors: DoctorModel[],
		options: IQueryParams,
	): Promise<DoctorModel[]> {
		const copy = [...doctors];
		if (options.filterBy) {
			return this.filter(copy, options.filterBy);
		}
		if (options.sortBy) {
			return await this.sort(doctors, options.sortBy);
		}
		return doctors;
	}

	private filter(doctors: DoctorModel[], filterParams: IFilterParam[]): DoctorModel[] {
		filterParams.forEach((filterParam: IFilterParam) => {
			doctors = doctors.filter((doctor: DoctorModel) => {
				if (!(filterParam.field in doctor)) {
					throw new HttpError(
						StatusCodeEnum.BAD_REQUEST,
						ErrorMessageEnum.UNKNOWN_QUERY_PARAMETER.replace('%s', filterParam.field),
					);
				}
				return doctor[filterParam.field] === filterParam.value;
			});
		});
		return doctors;
	}

	private async sort(doctors: DoctorModel[], sortParams: ISortParam[]): Promise<DoctorModel[]> {
		if (doctors.length < 1) {
			return doctors;
		}
		for (const param of sortParams) {
			if (param.field === DoctorsSortByEnum.APPOINTMENTS) {
				doctors = await this.sortByAppointments(doctors);
			} else {
				throw new HttpError(
					StatusCodeEnum.BAD_REQUEST,
					ErrorMessageEnum.UNKNOWN_QUERY_PARAMETER.replace('%s', param.field),
				);
			}
			doctors = param.order === 'asc' ? doctors : doctors.reverse();
		}
		return doctors;
	}

	private async sortByAppointments(doctors: DoctorModel[]) {
		const appointments = await this.getAppointments();
		const doctorsAppointmentsCount = appointments.reduce((acc, appointment) => {
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

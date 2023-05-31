import { DateTime } from 'luxon';
import { Transform } from 'class-transformer';

export class DoctorModel {
	public id: string;
	public userId: string;
	public speciality: string;

	@Transform(({ value }) => value.map((date) => DateTime.fromISO(date, { zone: 'utc' })))
	public availableSlots: DateTime[];
}

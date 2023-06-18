import { IsNotEmpty, IsDateString } from 'class-validator';
import { IsNotInThePast } from '../../common/decorator/is-not-in-the-past';

export class CreateAppointmentDto {
	@IsNotEmpty()
	public readonly patientId: string;

	@IsNotEmpty()
	public readonly doctorId: string;

	@IsDateString()
	@IsNotInThePast()
	public readonly date: string;

	constructor(patientId: string, doctorId: string, date: string) {
		this.patientId = patientId;
		this.doctorId = doctorId;
		this.date = date;
	}
}

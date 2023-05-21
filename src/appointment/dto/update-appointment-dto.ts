import { IsDateString, IsOptional } from 'class-validator';

export class UpdateAppointmentDto {
	public readonly patientId?: string;
	public readonly doctorId?: string;

	@IsOptional()
	@IsDateString()
	public readonly date?: string;
}

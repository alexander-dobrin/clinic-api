import { IsDateString, IsOptional } from 'class-validator';
import { IsNotInThePast } from '../../common/decorator';

export class UpdateAppointmentDto {
	@IsOptional()
	public readonly patientId?: string;

	@IsOptional()
	public readonly doctorId?: string;

	@IsOptional()
	@IsDateString()
	@IsNotInThePast()
	public readonly date?: string;
}

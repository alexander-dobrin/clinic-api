import { IsDateString, IsOptional } from 'class-validator';
import { IsNotInThePast } from '../../common/decorator';

export class UpdateDoctorDto {
	@IsOptional()
	public readonly speciality?: string;

	@IsOptional()
	@IsDateString({}, { each: true })
	@IsNotInThePast({ each: true })
	public readonly availableSlots: string[];

	constructor(speciality?: string, availableSlots: string[] = []) {
		this.speciality = speciality;
		this.availableSlots = availableSlots;
	}
}

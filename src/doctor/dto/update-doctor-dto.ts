import { IsDateString, IsOptional } from 'class-validator';
import { IsNotInThePast } from '../../common/decorator';

export default class UpdateDoctorDto {
	@IsOptional()
	public readonly firstName?: string;

	@IsOptional()
	public readonly speciality?: string;

	@IsOptional()
	@IsDateString({}, { each: true })
	@IsNotInThePast({ each: true })
	public readonly availableSlots: string[];

	constructor(firstName?: string, speciality?: string, availableSlots: string[] = []) {
		this.firstName = firstName;
		this.speciality = speciality;
		this.availableSlots = availableSlots;
	}
}

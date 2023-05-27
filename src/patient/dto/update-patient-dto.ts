import { IsOptional, IsPhoneNumber } from 'class-validator';

export class UpdatePatientDto {
	@IsOptional()
	@IsPhoneNumber()
	public readonly phoneNumber?: string;

	constructor(phoneNumber?: string) {
		this.phoneNumber = phoneNumber;
	}
}

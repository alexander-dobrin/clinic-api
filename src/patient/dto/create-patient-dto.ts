import { IsPhoneNumber } from 'class-validator';

export class CreatePatientDto {
	@IsPhoneNumber()
	public readonly phoneNumber: string;

	constructor(phoneNumber: string) {
		this.phoneNumber = phoneNumber;
	}
}

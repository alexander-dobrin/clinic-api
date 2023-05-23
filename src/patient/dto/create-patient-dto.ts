import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class CreatePatientDto {
	// Review: should pass firstName when creating patient if it is created in user model? So should we override?
	// @IsNotEmpty()
	// public readonly firstName: string;

	@IsPhoneNumber()
	public readonly phoneNumber: string;

	constructor(phoneNumber: string) {
		this.phoneNumber = phoneNumber;
	}
}

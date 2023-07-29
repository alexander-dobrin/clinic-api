import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class RegisterPatientDto {
	@IsEmail()
	email: string;

	@IsNotEmpty()
	password: string;

	@IsNotEmpty()
	firstName: string;

    @IsPhoneNumber()
    phoneNumber: string;
}

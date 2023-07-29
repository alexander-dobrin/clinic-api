import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterDoctortDto {
	@IsEmail()
	email: string;

	@IsNotEmpty()
	password: string;

	@IsNotEmpty()
	firstName: string;

    @IsNotEmpty()
    speciality: string;

    @IsOptional()
    availableSlots: string[];
}

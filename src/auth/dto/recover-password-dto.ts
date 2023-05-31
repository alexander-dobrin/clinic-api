import { IsNotEmpty } from 'class-validator';

export class RecoverPasswordDto {
	@IsNotEmpty()
	resetToken: string;

	@IsNotEmpty()
	password: string;
}

import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRoleEnum } from '../../common/enums';

export class RegisterDto {
	@IsEmail()
	email: string;

	@IsNotEmpty()
	password: string;

	@IsNotEmpty()
	firstName: string;

	@IsOptional()
	@IsEnum(UserRoleEnum)
	role: UserRoleEnum;
}

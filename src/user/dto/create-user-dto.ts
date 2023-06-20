import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRoleEnum } from '../../common/enums';
import { IsUniqueMail } from '../../common/decorator/is-unique-mail';

export class CreateUserDto {
	@IsEmail()
	@IsUniqueMail()
	email: string;

	@IsNotEmpty()
	password: string;

	@IsNotEmpty()
	firstName: string;

	@IsOptional()
	@IsEnum(UserRoleEnum)
	role?: UserRoleEnum;

	@IsOptional()
	@IsNotEmpty()
	activationLink?: string;
}

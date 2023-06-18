import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRoleEnum } from '../../common/enums';
import { IsUniqueMail } from '../../common/decorator/is-unique-mail';

export class UpdateUserDto {
	@IsOptional()
	@IsEmail()
	@IsUniqueMail()
	email?: string;

	@IsOptional()
	@IsNotEmpty()
	password?: string;

	@IsOptional()
	@IsNotEmpty()
	firstName?: string;

	@IsOptional()
	@IsEnum(UserRoleEnum)
	role?: UserRoleEnum;
}

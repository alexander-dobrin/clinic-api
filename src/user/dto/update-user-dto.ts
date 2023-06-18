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

	@IsOptional()
	@IsNotEmpty()
	resetToken?: string;

	constructor(
		email?: string,
		password?: string,
		firstName?: string,
		role?: UserRoleEnum,
		resetToken?: string,
	) {
		this.email = email;
		this.password = password;
		this.firstName = firstName;
		this.role = role;
		this.resetToken = resetToken;
	}
}

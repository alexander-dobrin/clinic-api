import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRoleEnum } from '../../common/enums';

export class UpdateUserDto {
	@IsOptional()
	@IsEmail()
	public readonly email?: string;

	@IsOptional()
	@IsNotEmpty()
	public password?: string;

	@IsOptional()
	@IsNotEmpty()
	public readonly firstName?: string;

	@IsOptional()
	@IsNotEmpty()
	public readonly role?: UserRoleEnum;

	@IsOptional()
	@IsNotEmpty()
	public readonly resetToken?: string;

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

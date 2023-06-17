import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRoleEnum } from '../../common/enums';

export class CreateUserDto {
	@IsEmail()
	public readonly email: string;

	@IsNotEmpty()
	public password: string;

	@IsNotEmpty()
	public readonly firstName: string;

	@IsOptional()
	@IsEnum(UserRoleEnum)
	public readonly role: UserRoleEnum;

	@IsOptional()
	@IsNotEmpty()
	public readonly activationLink: string;
}

import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRoleEnum } from '../../common/enums';
import { Transform } from 'class-transformer';

export class RegisterDto {
	@IsEmail()
	@Transform(({ value }) => value.toLowerCase())
	public readonly email: string;

	@IsNotEmpty()
	public password: string;

	@IsNotEmpty()
	public readonly firstName: string;

	@IsOptional()
	@IsNotEmpty()
	public readonly role: UserRoleEnum;
}

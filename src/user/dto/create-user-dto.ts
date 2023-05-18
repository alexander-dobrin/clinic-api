import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";
import { UserRoleEnum } from "../../common/enums";

export class CreateUserDto {
    @IsEmail()
    public readonly email: string;

    @IsNotEmpty()
    public password: string;

    @IsNotEmpty()
    public readonly firstName: string;

    @IsOptional()
    @IsNotEmpty()
    public readonly role: UserRoleEnum;
}
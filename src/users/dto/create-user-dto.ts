import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    public readonly email: string;

    @IsNotEmpty()
    public readonly password: string;

    @IsNotEmpty()
    public readonly firstName: string;
}
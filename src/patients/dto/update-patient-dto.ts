import { IsNotEmpty, IsOptional, IsPhoneNumber } from 'class-validator';

export default class UpdatePatientDto {   
    @IsOptional()
    @IsNotEmpty()
    public readonly firstName?: string;

    @IsOptional()
    @IsPhoneNumber()
    public readonly phoneNumber?: string;

    constructor(firstName?: string, phoneNumber?: string) {
        this.firstName = firstName;
        this.phoneNumber = phoneNumber;
    }
}
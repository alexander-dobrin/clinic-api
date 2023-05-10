import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export default class CreatePatientDto {
    @IsNotEmpty()
    public readonly firstName: string;

    @IsPhoneNumber()
    public readonly phoneNumber: string;

    constructor(firstName: string, phoneNumber: string) {
        this.firstName = firstName;
        this.phoneNumber = phoneNumber;
    }
}
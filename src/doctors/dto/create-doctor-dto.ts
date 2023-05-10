import { IsDateString, IsNotEmpty, IsOptional } from "class-validator";

export default class CreateDoctorDto {
    @IsNotEmpty()
    public readonly firstName: string;

    @IsNotEmpty()
    public readonly speciality: string;

    @IsOptional()
    @IsDateString({}, { each: true })
    public readonly availableSlots: string[];

    constructor(
        firstName: string,
        speciality: string,
        availableSlots: string[] = []
    ) {
        this.firstName = firstName;
        this.speciality = speciality;
        this.availableSlots = availableSlots;
    }
}
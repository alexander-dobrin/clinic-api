import { IsDateString, IsNotEmpty, IsOptional } from "class-validator";

export default class CreateDoctorDto {
    @IsNotEmpty()
    public firstName: string;

    @IsNotEmpty()
    public speciality: string;

    @IsOptional()
    @IsDateString({}, { each: true })
    public availableSlots: string[];

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
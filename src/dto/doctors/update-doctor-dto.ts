import { IsDateString, IsOptional, MinDate } from "class-validator";

export default class UpdateDoctorDto {
    public readonly firstName?: string;

    public readonly speciality?: string;

    @IsOptional()
    @IsDateString({}, { each: true })
    public readonly availableSlots: string[];

    constructor(
        firstName?: string,
        speciality?: string,
        availableSlots: string[] = []
    ) {
        this.firstName = firstName;
        this.speciality = speciality;
        this.availableSlots = availableSlots;
    }
}
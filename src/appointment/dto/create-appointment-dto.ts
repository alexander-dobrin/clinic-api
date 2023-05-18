import { IsNotEmpty, IsDateString } from "class-validator";

export class CreateAppointmentDto {
    @IsNotEmpty()
    public readonly patientId: string;

    @IsNotEmpty()
    public readonly doctorId: string;

    @IsDateString()
    public readonly date: string;

    constructor(
        patientId: string,
        doctorId: string,
        date: string
    ) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.date = date;
    }
}
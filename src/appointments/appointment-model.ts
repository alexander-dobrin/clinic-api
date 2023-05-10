import { Transform } from "class-transformer";
import { DateTime } from "luxon";

export default class AppointmentModel {
    public id: string;
    public patientId: string;
    public doctorId: string;

    @Transform(({ value }) => DateTime.fromISO(value, { zone: 'utc' }))
    public date: DateTime;

    constructor(
        id: string,
        patientId: string,
        doctorId: string,
        date: string
    ) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.date = DateTime.fromISO(date, { zone: 'utc' });
    }
}
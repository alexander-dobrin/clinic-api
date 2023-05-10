import { DateTime } from "luxon";
import { Transform } from "class-transformer";

export default class DoctorModel {
    public id: string;
    public firstName: string;
    public speciality: string;

    @Transform(({ value }) => value.map(date => DateTime.fromISO(date, { zone: 'utc' })))
    public availableSlots: DateTime[];
}
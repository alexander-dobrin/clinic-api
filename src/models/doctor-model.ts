import { DateTime } from "luxon";
import AppointmentModel from "./appointment-model";
import { Transform } from "class-transformer";

export default class DoctorModel {
    public id: string;
    public firstName: string;
    public speciality: string;

    @Transform(({ value }) => value.map(date => DateTime.fromISO(date, { zone: 'utc' })))
    public availableSlots: DateTime[];

    @Transform(({ value }) => value.map(a => new AppointmentModel(a.id, a.patientId, a.doctorId, a.date)))
    public appointments: AppointmentModel[];
}
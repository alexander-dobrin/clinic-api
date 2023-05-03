import { DateTime } from "luxon";
import { AppointmentEntity } from "./appointment-entity";

export default class DoctorModel {
    public id: string;
    public firstName: string;
    public speciality: string;
    public availableSlots: DateTime[];
    public appointments: AppointmentEntity[];

    constructor(
        id,
        firstName,
        speciality,
        availableSlots = [],
        appointments = []
    ) {
        this.id = id;
        this.firstName = firstName;
        this.speciality = speciality;
        this.availableSlots = availableSlots.map(dateString => DateTime.fromISO(dateString, { zone: 'utc' }));
        this.appointments = appointments.map(a => new AppointmentEntity(a.id, a.patientId, a.doctorId, a.startDate));
    }
}
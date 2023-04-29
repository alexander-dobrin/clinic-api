import { DateTime } from "luxon";
import { AppointmentEntity } from "./appointment-entity.mjs";

export class DoctorEntity {
    constructor(
        id,
        firstName,
        speciality,
        availableSlots,
        appointments = []) {
        this.id = id;
        this.firstName = firstName;
        this.speciality = speciality;
        this.availableSlots = availableSlots?.map(dateString => DateTime.fromISO(dateString, { zone: 'utc' }));
        this.appointments = appointments.map(a => new AppointmentEntity(
            a.patientId,
            a.doctorId,
            DateTime.fromISO(a.startDate, { zone: 'utc' })
        ));
    }
}
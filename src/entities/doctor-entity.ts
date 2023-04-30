import { DateTime } from "luxon";
import { AppointmentEntity } from "./appointment-entity";

export class DoctorEntity {
    constructor(
        public id,
        public firstName,
        public speciality,
        public availableSlots,
        public appointments = []) {
        this.id = id;
        this.firstName = firstName;
        this.speciality = speciality;
        this.availableSlots = availableSlots?.map(dateString => DateTime.fromISO(dateString, { zone: 'utc' }));
        this.appointments = appointments.map(a => new AppointmentEntity(
            a.id,
            a.patientId,
            a.doctorId,
            a.startDate
        ));
    }
}
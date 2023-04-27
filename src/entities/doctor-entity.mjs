import { DateTime } from "luxon";

export class DoctorEntity {
    id;
    firstName;
    speciality;
    availableSlots;

    constructor(id, firstName, speciality, availableAppointments) {
        this.id = id;
        this.firstName = firstName;
        this.speciality = speciality;
        this.availableSlots = availableAppointments.map(dateString => DateTime.fromISO(dateString, { zone: 'utc' }));
      }
}
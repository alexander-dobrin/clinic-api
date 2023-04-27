import { DateTime } from "luxon";

export class DoctorEntity {
    id;
    firstName;
    speciality;
    availableSlots;

    constructor(id, firstName, speciality, availableSlots) {
        this.id = id;
        this.firstName = firstName;
        this.speciality = speciality;
        this.availableSlots = availableSlots?.map(dateString => DateTime.fromISO(dateString, { zone: 'utc' }));
      }
}
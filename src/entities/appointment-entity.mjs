import { DateTime } from "luxon";

export class AppointmentEntity {
    patientId;
    doctorId;
    startDate;

    constructor(patientId, doctorId, startDate) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.startDate = DateTime.fromISO(startDate, { zone: 'utc' });
    }
}
import { DateTime } from "luxon";

export class AppointmentEntity {
    constructor(
        id, 
        patientId, 
        doctorId, 
        startDate
    ) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.startDate = DateTime.fromISO(startDate, { zone: 'utc' });
    }
}
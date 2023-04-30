import { DateTime } from "luxon";

export class AppointmentEntity {
    constructor(
        public id, 
        public patientId, 
        public doctorId, 
        public startDate
    ) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.startDate = DateTime.fromISO(startDate, { zone: 'utc' });
    }
}
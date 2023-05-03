import { DateTime } from "luxon";

export class AppointmentEntity {
    public date: DateTime;
    
    constructor(
        public id: string, 
        public patientId: string, 
        public doctorId: string, 
        date: string
    ) {
        this.date = DateTime.fromISO(date, { zone: 'utc' });
    }
}
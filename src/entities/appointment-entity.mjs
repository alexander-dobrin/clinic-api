export class AppointmentEntity {
    patientId;
    doctorId;
    startDate;

    constructor(patientId, doctorId, startDate) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.startDate = startDate;
    }
}
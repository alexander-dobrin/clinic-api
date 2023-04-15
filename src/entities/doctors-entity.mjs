export class DoctorEntity {
    id;
    firstName;
    speciality;
    availableAppointments;

    constructor(id, firstName, speciality, availableAppointments) {
        this.id = id;
        this.firstName = firstName;
        this.speciality = speciality;
        this.availableAppointments = availableAppointments.map(dateString => new Date(dateString));
      }
}
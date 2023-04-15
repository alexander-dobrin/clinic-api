export class PatientEntity {
    id;
    firstName;
    phone;

    constructor(id, firstName, phone) {
        this.id = id;
        this.firstName = firstName;
        this.phone = phone;
    }
}
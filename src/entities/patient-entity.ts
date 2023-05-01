export class PatientEntity {
    firstName;
    phone;
    id;

    constructor(firstName, phone) {
        this.firstName = firstName;
        this.phone = phone;
        this.id = phone;
    }
}
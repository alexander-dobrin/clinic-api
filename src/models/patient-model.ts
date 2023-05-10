export default class PatientModel {
    public id: string;
    public firstName: string;
    public phoneNumber: string;

    constructor(id: string, firstName: string, phoneNumber: string) {
        this.id = id;
        this.firstName = firstName;
        this.phoneNumber = phoneNumber;
    }
}
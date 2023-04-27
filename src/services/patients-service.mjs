import { PatientCreationException } from "../exceptions/patient-creation-exception.mjs";

export class PatientsService {
    PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

    constructor(patientsRepository) {
        this.patientsRepository = patientsRepository;
    }

    add(patient) {
        const isValidPhone = this.PHONE_REGEX.test(patient.phone);
        if (!isValidPhone) {
            throw new PatientCreationException(`invalid phone format [${patient.phone}], E.164 expected`);
        }

        const isPatientExists = this.patientsRepository.getAll().some(p => p.phone === patient.phone);
        if (isPatientExists) {
            throw new PatientCreationException(`patient with phone [${patient.phone}] allready exists`);
        }

        this.patientsRepository.addOne(patient);
        return patient;
    }

    getByPhone(phone) {
        return this.patientsRepository.getOne(phone);
    }

    getAll() {
        return this.patientsRepository.getAll();
    }

    update(oldPhone, newData) {
        const patient = this.patientsRepository.getOne(oldPhone);
        
        if (!patient) {
            throw new Error(`patient with phone [${oldPhone}] not exists`);
        }

        const isValidPhone = this.PHONE_REGEX.test(patient.phone);
        if (!isValidPhone) {
            throw new Error(`invalid phone format [${patient.phone}], E.164 expected`);
        }        

        patient.firstName = newData.firstName ?? patient.firstName;
        patient.phone = newData.phone ?? patient.phone;

        const updated = this.patientsRepository.update(oldPhone, patient);

        return updated;
    }

    delete(phone) {
        const deleted = this.patientsRepository.delete(phone);

        if (!deleted) {
            throw new Error(`Patient with phone ${phone} not found`);
        }

        return deleted;
    }
}
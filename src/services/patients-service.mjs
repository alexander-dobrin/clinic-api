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
}
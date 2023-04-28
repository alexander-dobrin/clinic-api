import { PatientEntity } from "../entities/patient-entity.mjs";
import { DuplicateEntityError } from "../exceptions/duplicate-entity-error.mjs";
import { InvalidParameterError } from "../exceptions/invalid-parameter-error.mjs";
import { ERRORS } from "../error-messages.mjs";
import { MissingParameterError } from "../exceptions/missing-parameter-error.mjs";

export class PatientsService {
    PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

    constructor(patientsRepository) {
        this.patientsRepository = patientsRepository;
    }

    create(patientData) {
        const { firstName, phone } = patientData;

        if (!phone) {
            throw new MissingParameterError(ERRORS.MISSING_PARAMETER.replace('%s', 'phone'))
        }

        const isValidPhone = this.PHONE_REGEX.test(phone);
        if (!isValidPhone) {
            throw new InvalidParameterError(ERRORS.INVALID_PHONE_FORMAT.replace('%s', phone));
        }
        
        const isPatientExists = this.patientsRepository.getAll().some(p => p.phone === phone);
        if (isPatientExists) {
            throw new DuplicateEntityError(ERRORS.ENTITY_ALREADY_EXISTS.replace('%s', phone));
        }

        const patient = new PatientEntity(firstName, phone)
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
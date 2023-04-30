import { PatientEntity } from "../entities/patient-entity";
import { DuplicateEntityError } from "../exceptions/duplicate-entity-error";
import { InvalidParameterError } from "../exceptions/invalid-parameter-error";
import { ERRORS } from "../error-messages";
import { MissingParameterError } from "../exceptions/missing-parameter-error";
import { REGEXPRESSIONS } from '../regular-expressions';

export class PatientsService {
    patientsRepository;

    constructor(patientsRepository) {
        this.patientsRepository = patientsRepository;
    }

    create(patientData) {
        const { firstName, phone } = patientData;

        if (!phone) {
            throw new MissingParameterError(ERRORS.MISSING_PARAMETER.replace('%s', 'phone'));
        }

        const isValidPhone = REGEXPRESSIONS.PHONE_NUMBER.test(phone);
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

    update(newData) {
        const { oldPhone, phone, firstName } = newData;

        if (!oldPhone || !phone) {
            throw new MissingParameterError(ERRORS.MISSING_PARAMETER.replace('%s', 'phone or oldPhone'));
        }

        const patient = this.patientsRepository.getOne(oldPhone);

        if (!patient) {
            return;
        }        

        const isValidPhone = REGEXPRESSIONS.PHONE_NUMBER.test(oldPhone) && REGEXPRESSIONS.PHONE_NUMBER.test(phone);
        if (!isValidPhone) {
            throw new InvalidParameterError(ERRORS.INVALID_PHONE_FORMAT.replace('%s', `${oldPhone} or ${phone}`));
        }

        const isPatientExists = this.patientsRepository.getAll().some(p => p.phone === phone);
        if (isPatientExists) {
            throw new DuplicateEntityError(ERRORS.ENTITY_ALREADY_EXISTS.replace('%s', phone));
        }

        patient.firstName = firstName ?? patient.firstName;
        patient.phone = phone;

        const updated = this.patientsRepository.update(oldPhone, patient);

        return updated;
    }

    deleteByPhone(phone) {
        if (!phone) {
            throw new MissingParameterError(ERRORS.MISSING_PARAMETER.replace('%s', 'phone'));
        }

        const isValidPhone = REGEXPRESSIONS.PHONE_NUMBER.test(phone);
        if (!isValidPhone) {
            throw new InvalidParameterError(ERRORS.INVALID_PHONE_FORMAT.replace('%s', phone));
        }

        const deleted = this.patientsRepository.delete(phone);
        return deleted;
    }
}
import { PatientEntity } from "../entities/patient-entity";
import { DuplicateEntityError } from "../exceptions/duplicate-entity-error";
import { InvalidParameterError } from "../exceptions/invalid-parameter-error";
import { ERRORS } from "../error-messages";
import { MissingParameterError } from "../exceptions/missing-parameter-error";
import { REGEXPRESSIONS } from '../regular-expressions';
import PatientsRepository from "../repositories/patients-repository";

export default class PatientsService {
    constructor(
        private readonly repository: PatientsRepository
        ) {
        
    }

    public async create(patientData: PatientEntity): Promise<PatientEntity> {
        const { firstName, phone } = patientData;

        if (!phone) {
            throw new MissingParameterError(ERRORS.MISSING_PARAMETER.replace('%s', 'phone'));
        }

        const isValidPhone = REGEXPRESSIONS.PHONE_NUMBER.test(phone);
        if (!isValidPhone) {
            throw new InvalidParameterError(ERRORS.INVALID_PHONE_FORMAT.replace('%s', phone));
        }
        
        const isPatientExists = (await this.repository.getAll()).some(p => p.phone === phone);
        if (isPatientExists) {
            throw new DuplicateEntityError(ERRORS.ENTITY_ALREADY_EXISTS.replace('%s', phone));
        }

        const patient = new PatientEntity(firstName, phone)
        const added = await this.repository.add(patient);
        
        return added;
    }

    public async getByPhone(phone: string): Promise<PatientEntity | undefined> {
        return this.repository.get(phone);
    }

    public async getAll(): Promise<PatientEntity[]> {
        return this.repository.getAll();
    }

    public async update(oldPhone: string, newData: PatientEntity): Promise<PatientEntity | undefined> {
        const { phone, firstName } = newData;

        if (!oldPhone && !phone) {
            throw new MissingParameterError(ERRORS.MISSING_PARAMETER.replace('%s', 'phone or oldPhone'));
        }

        const patient = await this.repository.get(oldPhone);

        if (!patient) {
            return;
        }        

        const isValidPhone = REGEXPRESSIONS.PHONE_NUMBER.test(oldPhone) || REGEXPRESSIONS.PHONE_NUMBER.test(phone);
        if (!isValidPhone) {
            throw new InvalidParameterError(ERRORS.INVALID_PHONE_FORMAT.replace('%s', `${oldPhone} or ${phone}`));
        }

        const isPatientExists = (await this.repository.getAll()).some(p => p.phone === phone);
        if (isPatientExists) {
            throw new DuplicateEntityError(ERRORS.ENTITY_ALREADY_EXISTS.replace('%s', phone));
        }

        patient.firstName = firstName ?? patient.firstName;
        patient.phone = phone ?? patient.phone;
        patient.id = patient.phone;

        const updated = await this.repository.update(patient);

        return updated;
    }

    public async deleteByPhone(phone: string): Promise<PatientEntity | undefined> {
        if (!phone) {
            throw new MissingParameterError(ERRORS.MISSING_PARAMETER.replace('%s', 'phone'));
        }

        const isValidPhone = REGEXPRESSIONS.PHONE_NUMBER.test(phone);
        if (!isValidPhone) {
            throw new InvalidParameterError(ERRORS.INVALID_PHONE_FORMAT.replace('%s', phone));
        }

        const patientToDelete = await this.repository.get(phone);
        if (!patientToDelete) {
            return;
        }
        
        const deleted = await this.repository.remove(patientToDelete);
        return deleted;
    }
}
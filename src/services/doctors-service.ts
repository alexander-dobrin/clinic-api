import { v4 } from "uuid";
import { DoctorEntity } from "../entities/doctor-entity";
import { REGEXPRESSIONS } from "../regular-expressions";
import { InvalidParameterError } from "../exceptions/invalid-parameter-error";
import { ERRORS } from "../error-messages";
import { ORDERED_BY } from "../enums";
import { DoctorsRepository } from "../repositories/doctors-repository";

export class DoctorsService {    
    constructor(
        private readonly doctorsRepository: DoctorsRepository
    ) {
        
    }

    async create(doctorData) {
        const { firstName, speciality, availableSlots } = doctorData;

        const isValidDates = availableSlots.every(slot => REGEXPRESSIONS.ISO_DATE.test(slot));
        if (!isValidDates) {
            throw new InvalidParameterError(ERRORS.INVALID_DATE_FORMAT);
        }

        const doctor = new DoctorEntity(v4(), firstName, speciality, availableSlots ?? []);
        await this.doctorsRepository.add(doctor);
        return doctor;
    }

    async getAll(orderBy) {
        const doctors = await this.doctorsRepository.getAll();
        if (orderBy === ORDERED_BY.APPOINTMENTS_COUNT) {
            doctors.sort((a, b) => b.appointments.length - a.appointments.length);
        }
        return doctors;
    }

    async getById(id) {
        return this.doctorsRepository.get(id);
    }

    async update(newData) {
        const { id, ...data } = newData;
        const doctor = await this.doctorsRepository.get(id);

        if (!doctor) {
            return;
        }

        const isValidDates = data.availableSlots.every(slot => REGEXPRESSIONS.ISO_DATE.test(slot));
        if (!isValidDates) {
            throw new InvalidParameterError(ERRORS.INVALID_DATE_FORMAT);
        }        
        
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                doctor[key] = data[key];
            }
        });

        const updated = this.doctorsRepository.update(doctor);
        return updated;
    }

    async deleteById(id) {
        const deleted = await this.doctorsRepository.remove(id);
        return deleted;
    }
}
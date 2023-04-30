import { v4 } from "uuid";
import { DoctorEntity } from "../entities/doctor-entity";
import { REGEXPRESSIONS } from "../regular-expressions";
import { InvalidParameterError } from "../exceptions/invalid-parameter-error";
import { ERRORS } from "../error-messages";
import { ORDERED_BY } from "../enums";

export class DoctorsService {
    doctorsRepository;
    
    constructor(doctorsRepository) {
        this.doctorsRepository = doctorsRepository;
    }

    create(doctorData) {
        const { firstName, speciality, availableSlots } = doctorData;

        const isValidDates = availableSlots.every(slot => REGEXPRESSIONS.ISO_DATE.test(slot));
        if (!isValidDates) {
            throw new InvalidParameterError(ERRORS.INVALID_DATE_FORMAT);
        }

        const doctor = new DoctorEntity(v4(), firstName, speciality, availableSlots ?? []);
        this.doctorsRepository.addOne(doctor);
        return doctor;
    }

    getAll(orderBy) {
        const doctors = this.doctorsRepository.getAll();
        if (orderBy === ORDERED_BY.APPOINTMENTS_COUNT) {
            doctors.sort((a, b) => b.appointments.length - a.appointments.length);
        }
        return doctors;
    }

    getById(id) {
        return this.doctorsRepository.getOne(id);
    }

    update(newData) {
        const { id, ...data } = newData;
        const doctor = this.doctorsRepository.getOne(id);

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

    deleteById(id) {
        const deleted = this.doctorsRepository.delete(id);
        return deleted;
    }
}
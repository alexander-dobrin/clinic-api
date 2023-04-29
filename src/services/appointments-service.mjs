import { AppointmentEntity } from "../entities/appointment-entity.mjs";
import { AppointmentConflictError } from "../exceptions/appointment-conflict-error.mjs";
import { DateTime } from "luxon";
import { REGEXPRESSIONS } from "../regular-expressions.mjs";
import { ERRORS } from "../error-messages.mjs";
import { InvalidParameterError } from "../exceptions/invalid-parameter-error.mjs";
import { MissingParameterError } from "../exceptions/missing-parameter-error.mjs";

export class AppointmentsService {
    constructor(appointmentsRepository, patientsRepository, doctorsRepository) {
        this.appointmentsRepository = appointmentsRepository;
        this.patientsRepository = patientsRepository;
        this.doctorsRepository = doctorsRepository;
    }

    create(appointmentData) {
        const { patientId, doctorId, date: utcDateString } = appointmentData;

        if (!patientId || !doctorId || !utcDateString) {
            throw new MissingParameterError(ERRORS.MISSING_PARAMETER.replace('%s', `patientId or doctorId or utcDateString`))
        }

        const patient = this.patientsRepository.getOne(patientId);
        const doctor = this.doctorsRepository.getOne(doctorId);
        
        if (!doctor || !patient) {
            return;
        }

        const isValidDate = REGEXPRESSIONS.ISO_DATE.test(utcDateString);
        if (!isValidDate) {
            throw new InvalidParameterError(ERRORS.INVALID_DATE_FORMAT);
        }
        
        const date = DateTime.fromISO(utcDateString, { zone: 'utc'});
        const isDateInThePast = date.diffNow().milliseconds < 0;
        if (isDateInThePast) {
            throw new InvalidParameterError(ERRORS.PAST_DATE.replace('%s', date.toISO()));
        }

        const doctorSlotIdx = doctor.availableSlots.findIndex(s => s.toISO() === date.toISO())
        if (doctorSlotIdx === -1) {
            throw new AppointmentConflictError(ERRORS.DOCTOR_NOT_AVAILABLE.replace('%s', doctorId).replace('%s', date.toISO()));
        }
        doctor.availableSlots.splice(doctorSlotIdx, 1);
        this.doctorsRepository.update(doctor);

        const appointment = new AppointmentEntity(patientId, doctorId, utcDateString);
        this.appointmentsRepository.addOne(appointment);
        return appointment;
    }

    getAll() {
        return this.appointmentsRepository.getAll();
    }
}
import { AppointmentEntity } from "../entities/appointment-entity";
import { AppointmentConflictError } from "../exceptions/appointment-conflict-error";
import { DateTime } from "luxon";
import { REGEXPRESSIONS } from "../regular-expressions";
import { ERRORS } from "../error-messages";
import { InvalidParameterError } from "../exceptions/invalid-parameter-error";
import { MissingParameterError } from "../exceptions/missing-parameter-error";
import { v4 } from "uuid";

export class AppointmentsService {
    appointmentsRepository;
    patientsService
    doctorsService;

    constructor(appointmentsRepository, patientsService, doctorsService) {
        this.appointmentsRepository = appointmentsRepository;
        this.patientsService = patientsService;
        this.doctorsService = doctorsService;
    }

    create(appointmentData) {
        const { patientId, doctorId, date: utcDateString } = appointmentData;

        if (!patientId || !doctorId || !utcDateString) {
            throw new MissingParameterError(ERRORS.MISSING_PARAMETER.replace('%s', `patientId or doctorId or utcDateString`))
        }

        const patient = this.patientsService.getByPhone(patientId);
        const doctor = this.doctorsService.getById(doctorId);
        
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

        const appointment = new AppointmentEntity(v4(), patientId, doctorId, utcDateString);

        doctor.availableSlots.splice(doctorSlotIdx, 1);
        doctor.appointments.push(appointment);

        this.doctorsService.update(doctor);

        this.appointmentsRepository.addOne(appointment);
        return appointment;
    }

    getAll() {
        return this.appointmentsRepository.getAll();
    }

    getById(id) {
        return this.appointmentsRepository.getAll()
            .find(a => a.id === id);
    }

    put(newData) {
        const { id, patientId, doctorId, startDate: utcDateString } = newData;

        if (!patientId || !doctorId || !utcDateString) {
            throw new MissingParameterError(ERRORS.MISSING_PARAMETER.replace('%s', `patientId or doctorId or utcDateString`))
        }

        const appointment = this.appointmentsRepository.getOne(id)
        if (!appointment) {
            return;
        }
        
        const patient = this.patientsService.getByPhone(patientId);
        const doctor = this.doctorsService.getById(doctorId);


        if (!doctor || !patient) {
            throw new InvalidParameterError(ERRORS.ENTITY_NOT_EXISTS.replace('%s', `${doctorId} or ${patientId}`));
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
        
        const oldAppointmentIdx = doctor.appointments.findIndex(a => a.startDate === appointment.startDate);
        doctor.appointments.splice(oldAppointmentIdx, 1);

        Object.keys(newData).forEach(key => {
            if (newData[key] !== undefined) {
                appointment[key] = newData[key];
            }
        });

        const updated = this.appointmentsRepository.update(appointment);
        
        doctor.appointments.push(updated);
        this.doctorsService.update(doctor);

        return updated;
    }

    deleteById(id) {
        const appointment = this.appointmentsRepository.getOne(id);
        if (!appointment) {
            return;
        }
        const responsibleDoctor = this.doctorsService.getById(appointment.doctorId);
        const idxToRemove = responsibleDoctor.appointments.findIndex(a => a.id === id);
        responsibleDoctor.appointments.splice(idxToRemove, 1);
        this.doctorsService.update(responsibleDoctor);

        const deleted = this.appointmentsRepository.delete(id);
        return deleted;
    }
}
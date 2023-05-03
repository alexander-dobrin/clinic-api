import { AppointmentEntity } from "../entities/appointment-entity";
import { AppointmentConflictError } from "../exceptions/appointment-conflict-error";
import { DateTime } from "luxon";
import { REGEXPRESSIONS } from "../regular-expressions";
import { ERRORS } from "../error-messages";
import { InvalidParameterError } from "../exceptions/invalid-parameter-error";
import { MissingParameterError } from "../exceptions/missing-parameter-error";
import { v4 } from "uuid";
import AppointmentsRepository from "../repositories/appointments-repository";
import PatientsService from "./patients-service";
import DoctorsService from "./doctors-service";
import AppointmentDto from "../dto/appointment-dto";

export default class AppointmentsService {
    constructor(
        private readonly repository: AppointmentsRepository, 
        private readonly patientsService: PatientsService, 
        private readonly doctorsService: DoctorsService
    ) {
        this.repository = repository;
        this.patientsService = patientsService;
        this.doctorsService = doctorsService;
    }

    public async create(appointmentData: AppointmentDto): Promise<AppointmentEntity | undefined> {
        const { patientId, doctorId, date: utcDateString } = appointmentData;

        if (!patientId || !doctorId || !utcDateString) {
            throw new MissingParameterError(ERRORS.MISSING_PARAMETER.replace('%s', `patientId or doctorId or utcDateString`))
        }

        const patient = await this.patientsService.getPatientById(patientId);
        const doctor = await this.doctorsService.getById(doctorId);
        
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

        await this.doctorsService.update(doctor);

        await this.repository.add(appointment);
        return appointment;
    }

    public async getAll(): Promise<AppointmentEntity[]> {
        return this.repository.getAll();
    }

    public async getById(id): Promise<AppointmentEntity | undefined> {
        return (await this.repository.getAll())
            .find(a => a.id === id);
    }

    public async put(newData: AppointmentDto): Promise<AppointmentEntity | undefined> {
        const { id, patientId, doctorId, date: utcDateString } = newData;

        if (!patientId || !doctorId || !utcDateString) {
            throw new MissingParameterError(ERRORS.MISSING_PARAMETER.replace('%s', `patientId or doctorId or utcDateString`))
        }

        const appointment = await this.repository.get(id)
        if (!appointment) {
            return;
        }
        
        const patient = await this.patientsService.getPatientById(patientId);
        const doctor = await this.doctorsService.getById(doctorId);


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
        
        const oldAppointmentIdx = doctor.appointments.findIndex(a => a.date === appointment.date);
        doctor.appointments.splice(oldAppointmentIdx, 1);

        Object.keys(newData).forEach(key => {
            if (newData[key] !== undefined) {
                appointment[key] = newData[key];
            }
        });

        const updated = await this.repository.update(appointment);
        
        doctor.appointments.push(updated);
        await this.doctorsService.update(doctor);

        return updated;
    }

    public async deleteById(id): Promise<AppointmentEntity | undefined> {
        const appointment = await this.repository.get(id);
        if (!appointment) {
            return;
        }
        const responsibleDoctor = await this.doctorsService.getById(appointment.doctorId);
        const idxToRemove = responsibleDoctor.appointments.findIndex(a => a.id === id);
        responsibleDoctor.appointments.splice(idxToRemove, 1);
        this.doctorsService.update(responsibleDoctor);

        const deleted = await this.repository.remove(id);
        return deleted;
    }
}
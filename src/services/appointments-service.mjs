import { AppointmentEntity } from "../entities/appointment-entity.mjs";
import { AppointmentCreationException } from "../exceptions/appointment-creation-exception.mjs";
import { DateTime } from "luxon";

export class AppointmentsService {
    constructor(appointmentsRepository, patientsRepository, doctorsRepository) {
        this.appointmentsRepository = appointmentsRepository;
        this.patientsRepository = patientsRepository;
        this.doctorsRepository = doctorsRepository;
    }

    schedule(patientId, doctorId, utcDateString) {
        const patient = this.patientsRepository.getOne(patientId);
        const doctor = this.doctorsRepository.getOne(doctorId);
        
        if (!doctor || !patient) {
            throw new AppointmentCreationException(`Information about one of the participants [${patientId} | ${doctorId}] does not exist`);
        }
        
        const date = DateTime.fromISO(utcDateString, { zone: 'utc'});
        const isDateInThePast = date.diffNow().milliseconds < 0;
        if (isDateInThePast) {
            throw new AppointmentCreationException(`Appointment can not be in the past [${utcDateString}]`);
        }

        const isDoctorSlotAvailable = doctor.availableSlots.some(s => s.toISO() === date.toISO())
        if (!isDoctorSlotAvailable) {
            throw new AppointmentCreationException(`Doctor [${doctorId}] is not available at [${utcDateString}]`);
        }        

        const appointment = new AppointmentEntity(patientId, doctorId, utcDateString);
        this.appointmentsRepository.addOne(appointment);
        return appointment;
    }

    getAll() {
        return this.appointmentsRepository.getAll();
    }
}
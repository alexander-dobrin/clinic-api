import { AppointmentEntity } from "../entities/appointment-entity.mjs";
import { AppointmentCreationException } from "../exceptions/appointment-creation-exception.mjs";

export class AppointmentsService {
    constructor(appointmentsRepository, patientsRepository, doctorsRepository) {
        this.appointmentsRepository = appointmentsRepository;
        this.patientsRepository = patientsRepository;
        this.doctorsRepository = doctorsRepository;
    }

    schedule(patientId, doctorId, date) {
        const patient = this.patientsRepository.getOne(patientId);
        const doctor = this.doctorsRepository.getOne(doctorId);
        
        if (!doctor || !patient) {
            throw new AppointmentCreationException(`Information about one of the participants [${patientId} | ${doctorId}] does not exist`);
        }
        
        const isDateInThePast = (new Date(date).getTime() - Date.now()) < 0;
        if (isDateInThePast) {
            throw new AppointmentCreationException(`Appointment can not be in the past [${date}]`);
        }

        const isDoctorSlotAvailable = doctor.availableSlots.some(s => s.toISOString() === date)
        if (!isDoctorSlotAvailable) {
            throw new AppointmentCreationException(`Doctor [${doctorId}] is not available at [${date}]`);
        }        

        const appointment = new AppointmentEntity(patientId, doctorId, new Date(date));
        this.appointmentsRepository.addOne(appointment);
    }
}
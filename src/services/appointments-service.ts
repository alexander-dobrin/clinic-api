import AppointmentModel from "../models/appointment-model";
import { AppointmentConflictError } from "../errors/appointment-conflict-error";
import { DateTime } from "luxon";
import { InvalidParameterError } from "../errors/invalid-parameter-error";
import { v4 } from "uuid";
import AppointmentsRepository from "../repositories/appointments-repository";
import PatientsService from "./patients-service";
import DoctorsService from "./doctors-service";
import { ServiceEventEmitter } from "./service-event-emitter";
import { CreateAppointmentDto } from "../dto/appointments/create-appointment-dto";
import { plainToClass } from "class-transformer";
import { UpdateAppointmentDto } from "../dto/appointments/update-appointment-dto";
import { ErrorMessages } from "../enums/error-messages";
import { merge } from "lodash";

export default class AppointmentsService {
    private readonly repository: AppointmentsRepository;
    private readonly patientsService: PatientsService;
    private readonly doctorsService: DoctorsService;
    private readonly eventEmitter: ServiceEventEmitter;

    constructor(
        repository: AppointmentsRepository, 
        patientsService: PatientsService, 
        doctorsService: DoctorsService,
        eventEmitter: ServiceEventEmitter
    ) {
        this.repository = repository;
        this.patientsService = patientsService;
        this.doctorsService = doctorsService;
        this.eventEmitter = eventEmitter;
    }

    public async createAppointment(appointmentDto: CreateAppointmentDto): Promise<AppointmentModel | undefined> {
        const { patientId, doctorId, date } = appointmentDto;

        const patient = await this.patientsService.getPatientById(patientId);
        const doctor = await this.doctorsService.getDoctortById(doctorId);

        if (!patient || !doctor) {
            return;
        }        
        const isAvailable = await this.doctorsService.isDoctorAvailable(doctorId, DateTime.fromISO(date, { zone: 'utc' }))
        if (!isAvailable) {
            throw new AppointmentConflictError(ErrorMessages.DOCTOR_NOT_AVAILABLE.replace('%s', doctorId).replace('%s', date));
        }
        
        const appointment = plainToClass(AppointmentModel, { id: v4(), ...appointmentDto });
        await this.doctorsService.addAppointmentToDoctor(doctorId, appointment);
        
        return this.repository.add(appointment);
    }

    public async getAllAppointments(): Promise<AppointmentModel[]> {
        return this.repository.getAll();
    }

    public async getAppointmentById(id: string): Promise<AppointmentModel | undefined> {
        return this.repository.get(id);
    }

    public async updateAppointmentById(id: string, appointmentDto: UpdateAppointmentDto): Promise<AppointmentModel | undefined> {
        let appointment = await this.repository.get(id)
        if (!appointment) {
            return;
        }

        const { 
            patientId = appointment.patientId, 
            doctorId = appointment.doctorId, 
            date = appointment.date.toISO() 
        } = appointmentDto;
        
        const patient = await this.patientsService.getPatientById(patientId);
        const doctor = await this.doctorsService.getDoctortById(doctorId);

        if (!doctor) {
            throw new InvalidParameterError(ErrorMessages.UNKNOWN_ID.replace('%s', doctorId));
        }
        if (!patient) {
            throw new InvalidParameterError(ErrorMessages.UNKNOWN_ID.replace('%s', patientId));
        }
        const isAvailable = await this.doctorsService.isDoctorAvailable(doctorId, DateTime.fromISO(date, { zone: 'utc' }))
        if (!isAvailable) {
            throw new AppointmentConflictError(ErrorMessages.DOCTOR_NOT_AVAILABLE.replace('%s', doctorId).replace('%s', date));
        }

        await this.doctorsService.removeAppointmentFromDoctor(doctorId, appointment.id);
        merge(appointment, appointmentDto);
        appointment = plainToClass(AppointmentModel, appointment);
        await this.doctorsService.addAppointmentToDoctor(doctorId, appointment);

        return this.repository.update(appointment);
    }

    public async deleteAppointmentById(id: string): Promise<AppointmentModel | undefined> {
        const appointment = await this.repository.get(id);
        if (!appointment) {
            return;
        }
        const removed = this.doctorsService.removeAppointmentFromDoctor(appointment.doctorId, id);
        if (!removed) {
            return;
        }
        return this.repository.remove(appointment);
    }

    public async deleteAllAppointmentsById(ids: string[]): Promise<void> {
        await Promise.all(ids.map(id => this.deleteAppointmentById(id)));
    }
}
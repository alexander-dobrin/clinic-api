import AppointmentModel from "../models/appointment-model";
import { DateTime } from "luxon";
import { v4 } from "uuid";
import AppointmentsRepository from "../repositories/appointments-repository";
import PatientsService from "./patients-service";
import DoctorsService from "./doctors-service";
import { CreateAppointmentDto } from "../dto/appointments/create-appointment-dto";
import { plainToClass } from "class-transformer";
import { UpdateAppointmentDto } from "../dto/appointments/update-appointment-dto";
import { merge } from "lodash";
import { IAppointmentsService } from "./abstract/appointments-service-interface";
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { TYPES } from "../types";

@injectable()
export default class AppointmentsService implements IAppointmentsService {
    constructor(
        @inject(TYPES.APPOINTMENTS_REPOSITORY) private readonly repository: AppointmentsRepository, 
        @inject(TYPES.PATIENTS_SERVICE) private readonly patientsService: PatientsService, 
        @inject(TYPES.DOCTORS_SERVICE) private readonly doctorsService: DoctorsService,
    ) {
    }

    public async createAppointment(appointmentDto: CreateAppointmentDto): Promise<AppointmentModel | undefined> {
        const { patientId, doctorId, date } = appointmentDto;

        const doParticipantsExist = await this.patientsService.isExists(patientId) &&
            await this.doctorsService.isExists(doctorId);
        if (!doParticipantsExist) {
            return;
        }
        
        const appointment = plainToClass(AppointmentModel, { id: v4(), ...appointmentDto });
        const isScheduled = await this.doctorsService.takeFreeSlot(doctorId, DateTime.fromISO(date, { zone: 'utc' }));
        if (!isScheduled) {
            return;
        }
        
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

        const { patientId = appointment.patientId, doctorId = appointment.doctorId } = appointmentDto;
        
        const doParticipantsExist = await this.patientsService.isExists(patientId) &&
            await this.doctorsService.isExists(doctorId);
        if (!doParticipantsExist) {
            return;
        }
        
        merge(appointment, appointmentDto);
        appointment = plainToClass(AppointmentModel, appointment);
        await this.doctorsService.takeFreeSlot(doctorId, appointment.date);

        return this.repository.update(appointment);
    }

    public async deleteAppointmentById(id: string): Promise<AppointmentModel | undefined> {
        const appointment = await this.repository.get(id);
        if (!appointment) {
            return;
        }
        return this.repository.remove(appointment);
    }

    public async getAllDoctorAppointments(id: string): Promise<AppointmentModel[]> {
        return (await this.repository.getAll()).filter(a => a.doctorId === id);
    }
}
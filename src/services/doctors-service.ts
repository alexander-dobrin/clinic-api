import { v4 } from "uuid";
import DoctorModel from "../models/doctor-model";
import DoctorsRepository from "../repositories/doctors-repository";
import { IGetOptions } from "./abstract/get-options-interface";
import CreateDoctorDto from "../dto/doctors/create-doctor-dto";
import { plainToClass } from "class-transformer";
import UpdateDoctorDto from "../dto/doctors/update-doctor-dto";
import { merge } from "lodash";
import { ServiceEventEmitter } from "./service-event-emitter";
import { ServiceEvent } from "../enums/service-event";
import { DateTime } from "luxon";
import AppointmentModel from "../models/appointment-model";

export default class DoctorsService {    
    private readonly repository: DoctorsRepository;
    private readonly eventEmitter: ServiceEventEmitter;

    constructor(repository: DoctorsRepository, eventEmitter: ServiceEventEmitter) {
        this.repository = repository;
        this.eventEmitter = eventEmitter;
    }

    public async createDoctor(doctorDto: CreateDoctorDto): Promise<DoctorModel> {
        const doctor =  plainToClass(DoctorModel, { id: v4(), ...doctorDto, appointments: [] });
        return await this.repository.add(doctor);
    }

    public async getAllDoctors(options: IGetOptions): Promise<DoctorModel[]> {
        const objects = await this.repository.getAll();
        const doctors = objects.map(d => plainToClass(DoctorModel, d));
        if (options.sortBy === SortBy.APPOINTMENTS_COUNT) {
            doctors.sort((a, b) => b.appointments.length - a.appointments.length);
        }        
        return doctors;
    }

    public async getDoctortById(id: string): Promise<DoctorModel | undefined> {
        const doctor = plainToClass(DoctorModel, await this.repository.get(id));
        return doctor;
    }

    public async updateDoctorById(id: string, doctorDto: UpdateDoctorDto): Promise<DoctorModel | undefined> {
        const doctor = await this.getDoctortById(id);
        
        if (!doctor) {
            return;
        }        
        merge(doctor, doctorDto);

        return this.repository.update(doctor);
    }

    public async deleteDoctorById(id: string): Promise<DoctorModel | undefined> {
        const doctor = await this.getDoctortById(id);
        if (!doctor) {
            return;
        }
        this.eventEmitter.emit(ServiceEvent.DOCTOR_DELETED, doctor);
        const deleted = await this.repository.remove(doctor);
        if (deleted) {
            this.eventEmitter.emit(ServiceEvent.DOCTOR_DELETED, doctor);
        }

        return deleted;
    }

    public async isDoctorAvailable(id: string, date: DateTime): Promise<boolean | undefined> {
        const doctor = await this.getDoctortById(id);
        if (!doctor) {
            return;
        }
        return doctor.availableSlots.some(s => s.toMillis() === date.toMillis());
    }

    public async addAppointmentToDoctor(id: string, appointment: AppointmentModel): Promise<DoctorModel | undefined> {
        const doctor = await this.getDoctortById(id);
        if (!doctor) {
            return;
        }
        const freeSlotIdx = doctor?.availableSlots.findIndex(s => s.equals(appointment.date.toUTC()));
        if (freeSlotIdx < 0) {
            return;
        }
        doctor.availableSlots.splice(freeSlotIdx, 1);
        doctor.appointments.push(appointment);
        
        return this.repository.update(doctor);
    }

    public async removeAppointmentFromDoctor(doctorId: string, appointmentId: string): Promise<DoctorModel | undefined> {
        const doctor = await this.getDoctortById(doctorId);
        if (!doctor) {
            return;
        }
        const appointmentIdx = doctor.appointments.findIndex(a => a.id = appointmentId);
        if (appointmentIdx < 0) {
            return;
        }
        doctor.appointments.splice(appointmentIdx, 1);
        
        return this.repository.update(doctor);
    }
}

enum SortBy {
    APPOINTMENTS_COUNT = 'appointmentsCount',
}
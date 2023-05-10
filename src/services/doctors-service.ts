import { v4 } from "uuid";
import DoctorModel from "../models/doctor-model";
import CreateDoctorDto from "../dto/doctors/create-doctor-dto";
import { plainToClass } from "class-transformer";
import UpdateDoctorDto from "../dto/doctors/update-doctor-dto";
import { merge } from "lodash";
import { ServiceEventEmitter } from "./service-event-emitter";
import { ServiceEvent } from "../enums/service-event";
import { DateTime } from "luxon";
import { IDoctorsService } from "./abstract/doctors-service-interface";
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { TYPES } from "../types";
import { IRepository } from "../repositories/repository-interface";
import { AppointmentConflictError } from "../errors/appointment-conflict-error";
import { ErrorMessages } from "../enums/error-messages";

@injectable()
export default class DoctorsService implements IDoctorsService {
    constructor(
        @inject(TYPES.DOCTORS_REPOSITORY) private readonly repository: IRepository<DoctorModel>, 
        @inject(TYPES.EVENT_EMITTER) private readonly eventEmitter: ServiceEventEmitter
    ) {
        
    }

    public async createDoctor(doctorDto: CreateDoctorDto): Promise<DoctorModel> {
        const doctor =  plainToClass(DoctorModel, { id: v4(), ...doctorDto });
        return this.repository.add(doctor);
    }

    public async getAllDoctors(): Promise<DoctorModel[]> {
        const objects = await this.repository.getAll();
        const doctors = objects.map(d => plainToClass(DoctorModel, d));
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
        const deleted = await this.repository.remove(doctor);
        if (deleted) {
            this.eventEmitter.emit(ServiceEvent.DOCTOR_DELETED, doctor);
        }

        return deleted;
    }

    public async takeFreeSlot(id: string, date: DateTime): Promise<boolean> {
        const doctor = await this.getDoctortById(id);
        if (!doctor) {
            return false;
        }
        const freeSlotIdx = doctor.availableSlots.findIndex(s => s.equals(date.toUTC()));
        if (freeSlotIdx < 0) {
            throw new AppointmentConflictError(ErrorMessages.DOCTOR_NOT_AVAILABLE.replace('%s', id).replace('%s', date.toISO()));
        }
        doctor.availableSlots.splice(freeSlotIdx, 1);
        this.repository.update(doctor);
        return true;
    }

    public async isExists(id: string): Promise<boolean> {
        return (await this.getDoctortById(id)) ? true : false;
    }
}
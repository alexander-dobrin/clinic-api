import { v4 } from "uuid";
import DoctorModel from "../entities/doctor-model";
import DoctorsRepository from "../repositories/doctors-repository";
import { IGetOptions } from "./abstract/get-options-interface";
import CreateDoctorDto from "../dto/doctors/create-doctor-dto";
import { plainToClass } from "class-transformer";
import UpdateDoctorDto from "../dto/doctors/update-doctor-dto";
import { merge } from "lodash";
import { ServiceEventEmitter } from "./service-event-emitter";
import { ServiceEvent } from "../enums/service-event";

export default class DoctorsService {    
    private readonly repository: DoctorsRepository;
    private readonly eventEmitter: ServiceEventEmitter;

    constructor(repository: DoctorsRepository, eventEmitter: ServiceEventEmitter) {
        this.repository = repository;
        this.eventEmitter = eventEmitter;
    }

    public async createDoctor(doctorDto: CreateDoctorDto): Promise<DoctorModel> {
        const doctor =  plainToClass(DoctorModel, { id: v4(), ...doctorDto });
        return await this.repository.add(doctor);
    }

    public async getAllDoctors(options: IGetOptions): Promise<DoctorModel[]> {
        const doctors = await this.repository.getAll();

        if (options.sortBy === sortBy.APPOINTMENTS_COUNT) {
            doctors.sort((a, b) => b.appointments.length - a.appointments.length);
        }
        
        return doctors;
    }

    public async geDoctortById(id: string): Promise<DoctorModel | undefined> {
        return this.repository.get(id);
    }

    public async updateDoctorById(id: string, doctorDto: UpdateDoctorDto): Promise<DoctorModel | undefined> {
        const doctor = await this.repository.get(id);
        
        if (!doctor) {
            return;
        }        
        merge(doctor, doctorDto);

        return this.repository.update(doctor);
    }

    public async deleteDoctorById(id: string): Promise<DoctorModel | undefined> {
        const doctor = await this.repository.get(id);
        if (!doctor) {
            return;
        }
        const deleted = await this.repository.remove(doctor);
        if (deleted) {
            this.eventEmitter.emit(ServiceEvent.DOCTOR_DELETED, id);
        }
        return deleted;
    }
}

enum sortBy {
    APPOINTMENTS_COUNT = 'appointmentsCount',
}
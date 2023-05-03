import { v4 } from "uuid";
import DoctorModel from "../entities/doctor-model";
import DoctorsRepository from "../repositories/doctors-repository";
import { IGetOptions } from "./abstract/get-options-interface";
import CreateDoctorDto from "../dto/doctors/create-doctor-dto";
import { plainToClass } from "class-transformer";
import UpdateDoctorDto from "../dto/doctors/update-doctor-dto";
import { merge } from "lodash";

export default class DoctorsService {    
    constructor(
        private readonly repository: DoctorsRepository
    ) {
        
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

    public async deleteById(id: string): Promise<DoctorModel | undefined> {
        const doctor = await this.repository.get(id);
        return await this.repository.remove(doctor);
    }
}

enum sortBy {
    APPOINTMENTS_COUNT = 'appointmentsCount',
}
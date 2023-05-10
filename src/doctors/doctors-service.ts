import { v4 } from "uuid";
import DoctorModel from "./doctor-model";
import CreateDoctorDto from "./dto/create-doctor-dto";
import { plainToClass } from "class-transformer";
import UpdateDoctorDto from "./dto/update-doctor-dto";
import { merge, groupBy } from "lodash";
import { ServiceEventEmitter } from "../common/services/service-event-emitter";
import { DoctorsSortByEnum, EventEnum } from "../common/enums";
import { DateTime } from "luxon";
import { IDoctorsService } from "./doctors-service-interface";
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { CONTAINER_TYPES } from "../common/constants";
import { IGetOptions, IRepository } from "../common/types";
import { AppointmentConflictError, UnableToSortError } from "../common/errors";
import { ErrorMessageEnum } from "../common/enums";
import AppointmentModel from "../appointments/appointment-model";
import DoctorWithAppointmentsViewModel from "./doctor-with-appointments-view-model";

@injectable()
export default class DoctorsService implements IDoctorsService {
    constructor(
        @inject(CONTAINER_TYPES.DOCTORS_REPOSITORY) private readonly doctorsRepository: IRepository<DoctorModel>, 
        @inject(CONTAINER_TYPES.APPOINTMENTS_REPOSITORY) private readonly appointmentsRepository: IRepository<AppointmentModel>,
        @inject(CONTAINER_TYPES.EVENT_EMITTER) private readonly eventEmitter: ServiceEventEmitter
    ) {
        
    }

    public async createDoctor(doctorDto: CreateDoctorDto): Promise<DoctorModel> {
        const doctor =  plainToClass(DoctorModel, { id: v4(), ...doctorDto });
        return this.doctorsRepository.add(doctor);
    }

    public async getAllDoctors(options: IGetOptions): Promise<DoctorModel[] | DoctorWithAppointmentsViewModel[]> {
        if (options.sortBy === DoctorsSortByEnum.APPOINTMENTS) {
            const doctors = await this.getBuisiestDoctors();
            if (doctors.length < 1) {
                throw new UnableToSortError(ErrorMessageEnum.UNABLE_TO_SORT.replace('%s', DoctorsSortByEnum.APPOINTMENTS));
            }
            return this.getBuisiestDoctors();
        }
        const objects = await this.doctorsRepository.getAll();
        const doctors = objects.map(d => plainToClass(DoctorModel, d));
        return doctors;
    }

    public async getDoctortById(id: string): Promise<DoctorModel | undefined> {
        const doctor = plainToClass(DoctorModel, await this.doctorsRepository.get(id));
        return doctor;
    }

    public async updateDoctorById(id: string, doctorDto: UpdateDoctorDto): Promise<DoctorModel | undefined> {
        const doctor = await this.getDoctortById(id);
        
        if (!doctor) {
            return;
        }        
        merge(doctor, doctorDto);

        return this.doctorsRepository.update(doctor);
    }

    public async deleteDoctorById(id: string): Promise<DoctorModel | undefined> {
        const doctor = await this.getDoctortById(id);
        if (!doctor) {
            return;
        }
        const deleted = await this.doctorsRepository.remove(doctor);
        if (deleted) {
            this.eventEmitter.emit(EventEnum.DOCTOR_DELETED, doctor);
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
            throw new AppointmentConflictError(ErrorMessageEnum.DOCTOR_NOT_AVAILABLE.replace('%s', id).replace('%s', date.toISO()));
        }
        doctor.availableSlots.splice(freeSlotIdx, 1);
        this.doctorsRepository.update(doctor);
        return true;
    }

    public async isExists(id: string): Promise<boolean> {
        return (await this.getDoctortById(id)) ? true : false;
    }

    private async getBuisiestDoctors(): Promise<DoctorWithAppointmentsViewModel[]> {
        const appointments = await this.appointmentsRepository.getAll();
        const appointmentsByDoctorId = groupBy(appointments, a => a.doctorId);
        return (await Promise.all(Object.entries(appointmentsByDoctorId)
            .map(async group => {
                const doctorId = group[0];
                const appointments = group[1];
                return new DoctorWithAppointmentsViewModel(
                    (await this.doctorsRepository.get(doctorId)).firstName,
                    appointments.length
                )
            })))
            .sort((a, b) => b.appointmentsCount - a.appointmentsCount);
    }
}
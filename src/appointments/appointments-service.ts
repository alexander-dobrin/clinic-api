import AppointmentModel from "./appointment-model";
import { DateTime } from "luxon";
import { v4 } from "uuid";
import AppointmentsRepository from "./appointments-repository";
import PatientsService from "../patients/patients-service";
import DoctorsService from "../doctors/doctors-service";
import { CreateAppointmentDto } from "./dto/create-appointment-dto";
import { plainToClass } from "class-transformer";
import { UpdateAppointmentDto } from "./dto/update-appointment-dto";
import { merge } from "lodash";
import { IAppointmentsService } from "./appointments-service-interface";
import { injectable, inject } from 'inversify';

import { CONTAINER_TYPES } from "../common/constants";
import { IFilterParam, IQueryParams } from "../common/types";
import { AppointmentsFilterByEnum, ErrorMessageEnum } from "../common/enums";
import { UnableToFilterError } from "../common/errors";

@injectable()
export default class AppointmentsService implements IAppointmentsService {
    constructor(
        @inject(CONTAINER_TYPES.APPOINTMENTS_REPOSITORY) private readonly repository: AppointmentsRepository, 
        @inject(CONTAINER_TYPES.PATIENTS_SERVICE) private readonly patientsService: PatientsService, 
        @inject(CONTAINER_TYPES.DOCTORS_SERVICE) private readonly doctorsService: DoctorsService,
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

    public async getAllAppointments(options: IQueryParams): Promise<AppointmentModel[]> {
        let appointments = await this.repository.getAll();
        if (options.filterBy) {
            appointments = this.filterAppointments(appointments, options.filterBy);
        }
        return appointments;
    }

    private filterAppointments(appointments: AppointmentModel[], filterParams: IFilterParam[]): AppointmentModel[] {
        let filtered = appointments;
        for (const param of filterParams) {
            param.field = param.field.toLowerCase();
            if (param.field === AppointmentsFilterByEnum.DOCTORS) {
                filtered = this.filterByDoctors(appointments, param.value);
            } else if (param.field === AppointmentsFilterByEnum.PATIENTS) {
                filtered = this.filterByPatients(appointments, param.value);
            } else {
                throw new UnableToFilterError(ErrorMessageEnum.UNKNOWN_QUERY_PARAMETER.replace('%s', param.field));
            }
        }
        return filtered;
    }

    private filterByDoctors(appointments: AppointmentModel[], doctorId: string): AppointmentModel[] {
        return appointments.filter(a => a.doctorId === doctorId);
    }

    private filterByPatients(appointments: AppointmentModel[], patientId: string): AppointmentModel[] {
        return appointments.filter(a => a.patientId === patientId);
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
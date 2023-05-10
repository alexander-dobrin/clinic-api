import { ServiceEvent } from "../enums/service-event";
import DoctorModel from "../models/doctor-model";
import { TYPES } from "../types";
import AppointmentsService from "./appointments-service";
import DoctorsService from "./doctors-service";
import { ServiceEventEmitter } from "./service-event-emitter";
import { inject, injectable } from "inversify";
import "reflect-metadata";

@injectable()
export default class ModelsCoordinationService {
    constructor(
        @inject(TYPES.EVENT_EMITTER) private readonly eventsEmitter: ServiceEventEmitter, 
        @inject(TYPES.DOCTORS_SERVICE) private readonly doctorsService: DoctorsService,
        @inject(TYPES.APPOINTMENTS_SERVICE) private readonly appointmentsService: AppointmentsService
    ) {
        this.eventsEmitter = eventsEmitter;
        this.doctorsService = doctorsService;
        this.appointmentsService = appointmentsService;
        this.eventsEmitter.on(ServiceEvent.DOCTOR_DELETED, this.onDoctorDeleted.bind(this));
    }

    private async onDoctorDeleted(doctor: DoctorModel): Promise<void> {
        (await this.appointmentsService.getAllDoctorAppointments(doctor.id)).forEach(async a => {
            this.appointmentsService.deleteAppointmentById(a.id);
        });
    }
}
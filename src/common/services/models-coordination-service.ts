import { EventEnum } from "../enums";
import DoctorModel from "../../doctors/doctor-model";
import { CONTAINER_TYPES } from "../constants";
import AppointmentsService from "../../appointments/appointments-service";
import DoctorsService from "../../doctors/doctors-service";
import { ServiceEventEmitter } from "./service-event-emitter";
import { inject, injectable } from "inversify";
import "reflect-metadata";

@injectable()
export default class ModelsCoordinationService {
    constructor(
        @inject(CONTAINER_TYPES.EVENT_EMITTER) private readonly eventsEmitter: ServiceEventEmitter, 
        @inject(CONTAINER_TYPES.DOCTORS_SERVICE) private readonly doctorsService: DoctorsService,
        @inject(CONTAINER_TYPES.APPOINTMENTS_SERVICE) private readonly appointmentsService: AppointmentsService
    ) {
        this.eventsEmitter = eventsEmitter;
        this.doctorsService = doctorsService;
        this.appointmentsService = appointmentsService;
        this.eventsEmitter.on(EventEnum.DOCTOR_DELETED, this.onDoctorDeleted.bind(this));
    }

    private async onDoctorDeleted(doctor: DoctorModel): Promise<void> {
        (await this.appointmentsService.getAllDoctorAppointments(doctor.id)).forEach(async a => {
            this.appointmentsService.deleteAppointmentById(a.id);
        });
    }
}
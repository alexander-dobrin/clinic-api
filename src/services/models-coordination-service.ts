import { ServiceEvent } from "../enums/service-event";
import DoctorModel from "../models/doctor-model";
import AppointmentsService from "./appointments-service";
import DoctorsService from "./doctors-service";
import { ServiceEventEmitter } from "./service-event-emitter";

export default class ModelsCoordinationService {
    private readonly eventsEmitter: ServiceEventEmitter;
    private readonly doctorsService: DoctorsService;
    private readonly appointmentsService: AppointmentsService;

    constructor(
        eventsEmitter: ServiceEventEmitter, 
        doctorsService: DoctorsService,
        appointmentsService: AppointmentsService
    ) {
        this.eventsEmitter = eventsEmitter;
        this.doctorsService = doctorsService;
        this.appointmentsService = appointmentsService;
        this.eventsEmitter.on(ServiceEvent.DOCTOR_DELETED, this.onDoctorDeleted.bind(this));
    }

    private async onDoctorDeleted(doctor: DoctorModel): Promise<void> {
        this.appointmentsService.deleteAllAppointmentsById(doctor.appointments.map(a => a.id));
    }
}
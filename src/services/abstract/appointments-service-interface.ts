import { CreateAppointmentDto } from "../../dto/appointments/create-appointment-dto";
import { UpdateAppointmentDto } from "../../dto/appointments/update-appointment-dto";
import AppointmentModel from "../../models/appointment-model";

export interface IAppointmentsService {
    createAppointment(appointmentDto: CreateAppointmentDto): Promise<AppointmentModel | undefined>;
    getAllAppointments(): Promise<AppointmentModel[]>;
    getAppointmentById(id: string): Promise<AppointmentModel | undefined>;
    updateAppointmentById(id: string, appointmentDto: UpdateAppointmentDto): Promise<AppointmentModel | undefined>;
    deleteAppointmentById(id: string): Promise<AppointmentModel | undefined>;
    deleteAllAppointmentsById(ids: string[]): Promise<void>;
}
import { CreateAppointmentDto } from "./dto/create-appointment-dto";
import { UpdateAppointmentDto } from "./dto/update-appointment-dto";
import AppointmentModel from "./appointment-model";

export interface IAppointmentsService {
    createAppointment(appointmentDto: CreateAppointmentDto): Promise<AppointmentModel | undefined>;
    getAllAppointments(): Promise<AppointmentModel[]>;
    getAppointmentById(id: string): Promise<AppointmentModel | undefined>;
    updateAppointmentById(id: string, appointmentDto: UpdateAppointmentDto): Promise<AppointmentModel | undefined>;
    deleteAppointmentById(id: string): Promise<AppointmentModel | undefined>;
    getAllDoctorAppointments(id: string): Promise<AppointmentModel[]>;
}
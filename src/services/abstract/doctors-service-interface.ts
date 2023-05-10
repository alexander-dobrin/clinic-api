import { DateTime } from "luxon";
import CreateDoctorDto from "../../dto/doctors/create-doctor-dto";
import UpdateDoctorDto from "../../dto/doctors/update-doctor-dto";
import AppointmentModel from "../../models/appointment-model";
import DoctorModel from "../../models/doctor-model";
import { IGetOptions } from "./get-options-interface";

export interface IDoctorsService {
    createDoctor(doctorDto: CreateDoctorDto): Promise<DoctorModel>;
    getAllDoctors(options: IGetOptions): Promise<DoctorModel[]>;
    getDoctortById(id: string): Promise<DoctorModel | undefined>;
    updateDoctorById(id: string, DoctorDto: UpdateDoctorDto): Promise<DoctorModel | undefined>;
    removeAppointmentFromDoctor(doctorId: string, appointmentId: string): Promise<DoctorModel | undefined>;
    addAppointmentToDoctor(id: string, appointment: AppointmentModel): Promise<DoctorModel | undefined>;
    isDoctorAvailable(id: string, date: DateTime): Promise<boolean | undefined>;
    deleteDoctorById(id: string): Promise<DoctorModel | undefined>;
}
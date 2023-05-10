import { DateTime } from "luxon";
import CreateDoctorDto from "./dto/create-doctor-dto";
import UpdateDoctorDto from "./dto/update-doctor-dto";
import DoctorModel from "./doctor-model";
import { IGetOptions } from "../common/types";
import DoctorWithAppointmentsViewModel from "./doctor-with-appointments-view-model";

export interface IDoctorsService {
    createDoctor(doctorDto: CreateDoctorDto): Promise<DoctorModel>;
    getAllDoctors(options: IGetOptions): Promise<DoctorModel[] | DoctorWithAppointmentsViewModel[]>;
    getDoctortById(id: string): Promise<DoctorModel | undefined>;
    updateDoctorById(id: string, DoctorDto: UpdateDoctorDto): Promise<DoctorModel | undefined>;
    deleteDoctorById(id: string): Promise<DoctorModel | undefined>;
    takeFreeSlot(id: string, date: DateTime): Promise<boolean | undefined>;
    isExists(id: string): Promise<boolean>;
}
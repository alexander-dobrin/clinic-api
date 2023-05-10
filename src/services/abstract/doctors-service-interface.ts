import { DateTime } from "luxon";
import CreateDoctorDto from "../../dto/doctors/create-doctor-dto";
import UpdateDoctorDto from "../../dto/doctors/update-doctor-dto";
import DoctorModel from "../../models/doctor-model";

export interface IDoctorsService {
    createDoctor(doctorDto: CreateDoctorDto): Promise<DoctorModel>;
    getAllDoctors(): Promise<DoctorModel[]>;
    getDoctortById(id: string): Promise<DoctorModel | undefined>;
    updateDoctorById(id: string, DoctorDto: UpdateDoctorDto): Promise<DoctorModel | undefined>;
    deleteDoctorById(id: string): Promise<DoctorModel | undefined>;
    takeFreeSlot(id: string, date: DateTime): Promise<boolean | undefined>;
    isExists(id: string): Promise<boolean>;
}
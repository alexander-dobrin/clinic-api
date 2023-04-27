import { v4 } from "uuid";
import { DoctorEntity } from "../entities/doctor-entity.mjs";

export class DoctorsService {
    constructor(doctorsRepository) {
        this.doctorsRepository = doctorsRepository;
    }

    add(doctorData) {
        const doctor = new DoctorEntity(v4(), doctorData.firstName, doctorData.speciality, doctorData.availableSlots ?? []);
        this.doctorsRepository.addOne(doctor);
        return doctor;
    }

    getAll() {
        return this.doctorsRepository.getAll();
    }

    getById(id) {
        return this.doctorsRepository.getOne(id);
    }

    update(id, data) {
        const doctor = this.doctorsRepository.getOne(id);

        if (!doctor) {
            throw new Error(`doctor [${id}] not found`);
        }

        doctor.firstName = data.firstName;
        doctor.speciality = data.speciality;
        doctor.availableSlots = data.availableSlots;
        const updated = this.doctorsRepository.update(doctor);
        return updated;
    }

    delete(id) {
        const deleted = this.doctorsRepository.delete(id);

        if (!deleted) {
            throw new Error(`Doctor with id ${id} not found`);
        }

        return deleted;
    }
}
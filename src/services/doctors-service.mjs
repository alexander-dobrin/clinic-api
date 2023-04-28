import { v4 } from "uuid";
import { DoctorEntity } from "../entities/doctor-entity.mjs";

export class DoctorsService {
    constructor(doctorsRepository) {
        this.doctorsRepository = doctorsRepository;
    }

    create(doctorData) {
        const { firstName, speciality, availableSlots } = doctorData;

        const doctor = new DoctorEntity(v4(), firstName, speciality, availableSlots ?? []);
        this.doctorsRepository.addOne(doctor);
        return doctor;
    }

    getAll() {
        return this.doctorsRepository.getAll();
    }

    getById(id) {
        return this.doctorsRepository.getOne(id);
    }

    update(newData) {
        const { id, ...data } = newData;
        const doctor = this.doctorsRepository.getOne(id);

        if (!doctor) {
            return;
        }
        
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                doctor[key] = data[key];
            }
        });

        const updated = this.doctorsRepository.update(doctor);
        return updated;
    }

    deleteById(id) {
        const deleted = this.doctorsRepository.delete(id);
        return deleted;
    }
}
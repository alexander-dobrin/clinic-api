import * as path from 'path';
import * as fs from 'fs';
import { DoctorEntity } from '../entities/doctor-entity.mjs';

export class DoctorsRepository {
    constructor() {
        this.dataPath = path.resolve('assets', 'doctors.json');
        this.pullData();
    }

    pullData() {
        const data = fs.readFileSync(this.dataPath, { encoding: 'utf8' }).toString();
        console.log(data);
        this.doctors = JSON.parse(data)
            .map(d => new DoctorEntity(d.id, d.firstName, d.speciality, d.availableSlots, d.appointments));
    }

    getAll() {
        this.pullData();
        return this.doctors;
    }

    getOne(id) {
        this.pullData();
        return this.doctors.find(d => d.id === id);
    }

    addOne(doctor) {
        this.doctors.push(doctor);
        this.saveData();
    }

    saveData() {
        fs.writeFileSync(this.dataPath, JSON.stringify(this.doctors, null, 2));
    }

    update(doctor) {
        this.pullData();
        const doctorIdx = this.doctors.findIndex(d => d.id === doctor.id);

        if (doctorIdx === -1) {
            return;
        }

        this.doctors[doctorIdx] = doctor;
        this.saveData();
        return doctor;
    }

    delete(id) {
        this.pullData();

        const doctorIdx = this.doctors.findIndex(d => d.id === id);

        if (doctorIdx === -1) {
            return;
        }

        const deletedDoctor = this.doctors.splice(doctorIdx, 1)[0];
        this.saveData();

        return deletedDoctor;
    }
}
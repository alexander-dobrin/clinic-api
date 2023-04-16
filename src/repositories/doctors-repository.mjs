import * as path from 'path';
import * as fs from 'fs';
import { DoctorEntity } from '../entities/doctor-entity.mjs';

export class DoctorsRepository {
    constructor() {
        const dataPath = path.resolve('assets', 'doctors.json');
        this.doctors = JSON.parse(fs.readFileSync(dataPath, { encoding: 'utf8' }))
            .map(d => new DoctorEntity(d.id, d.firstName, d.speciality, d.availableAppointments));
    }

    getAll() {
        return this.doctors;
    }

    getOne(id) {
        return this.doctors.find(d => d.id === id);
    }
}
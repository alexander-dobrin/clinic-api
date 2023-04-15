import * as path from 'path';
import * as fs from 'fs';
import { PatientEntity } from '../entities/patient-entity.mjs';

export class PatientsRepository {
    constructor() {
        const dataPath = path.resolve('assets', 'patients.json');
        this.patients = JSON.parse(fs.readFileSync(dataPath, { encoding: 'utf8' }))
            .map(p => new PatientEntity(p.id, p.firstName, p.phone));
    }

    getAll() {
        return this.patients;
    }

    getOne(id) {
        return this.patients.find(p => p.id === id);
    }
}
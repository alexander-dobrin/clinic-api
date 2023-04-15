import * as path from 'path';
import * as fs from 'fs';
import { DoctorEntity } from "../entities/doctors-entity.mjs";

export class DoctorsController {
    constructor() {
        const dataPath = path.resolve('assets', 'doctors.json');
        this.doctors = JSON.parse(fs.readFileSync(dataPath, { encoding: 'utf8' }))
            .map(d => new DoctorEntity(d.id, d.firstName, d.speciality, d.availableAppointments));
    }

    getAll(req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(this.doctors));
    }

    getOne(req, res) {
        res.setHeader('Content-Type', 'application/json');
        const url = new URL(req.url, `http://${req.headers.host}`);
        const one = this.doctors.find(d => d.id === url.searchParams.get('id'));
        res.end(JSON.stringify(one));
    }
}
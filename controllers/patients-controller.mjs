import * as path from 'path';
import * as fs from 'fs';
import { PatientEntity } from '../entities/patient-entity.mjs';

export class PatientsController {
    constructor() {
        const dataPath = path.resolve('assets', 'patients.json');
        this.patients = JSON.parse(fs.readFileSync(dataPath, { encoding: 'utf8' }))
            .map(p => new PatientEntity(p.id, p.firstName, p.phone));
    }

    getAll(req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(this.patients));
    }

    getOne(req, res) {
        res.setHeader('Content-Type', 'application/json');
        const url = new URL(req.url, `http://${req.headers.host}`);
        const one = this.patients.find(p => p.id === url.searchParams.get('id'));
        res.end(JSON.stringify(one));
    }
}
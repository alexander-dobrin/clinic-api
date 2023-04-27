import * as path from 'path';
import * as fs from 'fs';
import { AppointmentEntity } from '../entities/appointment-entity.mjs';

export class AppointmentsRepository {
    appointments = [];

    constructor() {
        this.dataFilePath = path.resolve('assets', 'appointments.json');
        if (!fs.existsSync(this.dataFilePath)) {
            fs.writeFileSync(this.dataFilePath, JSON.stringify(this.appointments));
            return;
        }
        this.pullData();
    }

    pullData() {
        const data = fs.readFileSync(this.dataFilePath, { encoding: 'utf-8' });
        this.appointments = JSON.parse(data.toString())
            .map(obj => new AppointmentEntity(obj.patientId, obj.doctorId, obj.startDate));
    }

    addOne(appointment) {
        this.appointments.push(appointment);
        fs.writeFileSync(this.dataFilePath, JSON.stringify(this.appointments, null, 2));
    }

    getAll() {
        this.pullData();
        return this.appointments;
    }
}
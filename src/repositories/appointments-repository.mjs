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
            .map(obj => new AppointmentEntity(obj.id, obj.patientId, obj.doctorId, obj.startDate));
    }

    addOne(appointment) {
        this.appointments.push(appointment);
        this.saveData();
    }

    getAll() {
        this.pullData();
        return this.appointments;
    }

    getOne(id) {
        this.pullData();
        return this.appointments.find(d => d.id === id);
    }

    saveData() {
        fs.writeFileSync(this.dataFilePath, JSON.stringify(this.appointments, null, 2));
    }

    update(appointment) {
        this.pullData();
        const idx = this.appointments.findIndex(a => a.id === appointment.id);

        if (idx === -1) {
            return;
        }

        this.appointments[idx] = appointment;
        this.saveData();
        return appointment;
    }

    delete(id) {
        this.pullData();

        const idx = this.appointments.findIndex(a => a.id === id);

        if (id === -1) {
            return;
        }

        const deleted = this.appointments.splice(id, 1)[0];
        this.saveData();

        return deleted;
    }
}
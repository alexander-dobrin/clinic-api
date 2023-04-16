import * as fs from 'fs';

export class AppointmentsRepository {
    appointments = [];

    constructor(dataFilePath) {
        this.dataFilePath = dataFilePath;
        if (!fs.existsSync(dataFilePath)) {
            fs.writeFileSync(dataFilePath, JSON.stringify(this.appointments));
            return;
        }
        this.appointments = this.pullData();
    }

    pullData() {
        const data = fs.readFileSync(this.dataFilePath, { encoding: 'utf-8' });
        return JSON.parse(data.toString());
    }

    addOne(appointment) {
        this.appointments.push(appointment);
        fs.writeFileSync(this.dataFilePath, JSON.stringify(this.appointments, null, 2));
    }

    getAll() {
        this.appointments = this.pullData();
        return this.appointments;
    }
}
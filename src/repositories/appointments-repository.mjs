import * as fs from 'fs';

export class AppointmentsRepository {
    appointments = [];

    constructor(dataFilePath) {
        this.dataFilePath = dataFilePath;
        if (!fs.existsSync(dataFilePath)) {
            fs.writeFileSync(dataFilePath, JSON.stringify(this.appointments));
            return;
        }
        const data = fs.readFileSync(dataFilePath, { encoding: 'utf-8' });
        this.appointments = JSON.parse(data.toString());
    }

    addOne(appointment) {
        this.appointments.push(appointment);
        fs.writeFileSync(this.dataFilePath, JSON.stringify(this.appointments, null, 2));
    }
}
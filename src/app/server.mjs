import * as http from 'http';
import * as path from 'path';
import { PatientsController } from '../controllers/patients-controller.mjs';
import { DoctorsController } from '../controllers/doctors-controller.mjs';
import { AppointmentsController } from '../controllers/appointments-controller.mjs';
import { PatientsRepository } from '../repositories/patients-repository.mjs';
import { DoctorsRepository } from '../repositories/doctors-repository.mjs';
import { AppointmentsRepository } from '../repositories/appointments-repository.mjs';
import { AppointmentsService } from '../services/appointments-service.mjs';

export class Server {
    constructor() {
        const patientsRepository = new PatientsRepository();
        const doctorsRepository = new DoctorsRepository();
        const apointmentsRepository = new AppointmentsRepository(path.resolve('assets', 'appointments.json'));

        const appointmentsService = new AppointmentsService(apointmentsRepository, patientsRepository, doctorsRepository)

        this.patientsController = new PatientsController(patientsRepository);
        this.doctorsController = new DoctorsController(doctorsRepository);
        this.appointmentsController = new AppointmentsController(appointmentsService);
    }

    getServer() {
        return http.createServer((req, res) => {
            const url = new URL(req.url, `http://${req.headers.host}`);

            if (url.pathname === '/patients') {

                if (url.searchParams.get('id')) {
                    this.patientsController.getOne(req, res);
                    return;
                }
                this.patientsController.getAll(req, res);

            } else if (url.pathname === '/doctors') {

                if (url.searchParams.get('id')) {
                    this.doctorsController.getOne(req, res);
                    return;
                }
                this.doctorsController.getAll(req, res);

            } else if (url.pathname === '/appointments') {

                if (!url.search) {
                    this.appointmentsController.getAll(req, res);
                    return;
                }

                this.appointmentsController.schedule(req, res);

            }

            res.statusCode = 404;
            res.end();
        });
    }
}
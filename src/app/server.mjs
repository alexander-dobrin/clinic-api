import * as http from 'http';
import { PatientsController } from '../controllers/patients-controller.mjs';
import { DoctorsController } from '../controllers/doctors-controller.mjs';
import { AppointmentsController } from '../controllers/appointments-controller.mjs';
import { PatientsRepository } from '../repositories/patients-repository.mjs';
import { DoctorsRepository } from '../repositories/doctors-repository.mjs';

export class Server {
    constructor() {
        const patientsRepository = new PatientsRepository();
        const doctorsRepository = new DoctorsRepository();

        this.patientsController = new PatientsController(patientsRepository);
        this.doctorsController = new DoctorsController(doctorsRepository);
        this.appointmentsController = new AppointmentsController(
            patientsRepository,
            doctorsRepository
        );
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

                this.appointmentsController.schedule(req, res);

            }

            res.statusCode = 404;
            res.end();
        });
    }
}
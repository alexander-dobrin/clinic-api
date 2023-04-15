import * as http from 'http';
import dotenv from 'dotenv';
import { PatientsController } from './controllers/patients-controller.mjs';
import { DoctorsController } from './controllers/doctors-controller.mjs';
import { AppointmentsController } from './controllers/appointments-controller.mjs';
import { PatientsRepository } from './repositories/patients-repository.mjs';
import { DoctorsRepository } from './repositories/doctors-repository.mjs';

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    if (url.pathname === '/patients') {
        const patientsController = new PatientsController(new PatientsRepository());
        
        if (url.searchParams.get('id')) {
            patientsController.getOne(req, res);
            return;
        }
        patientsController.getAll(req, res);
    } else if (url.pathname === '/doctors') {
        const doctorsController = new DoctorsController(new DoctorsRepository());

        if (url.searchParams.get('id')) {
            doctorsController.getOne(req, res);
            return;
        }
        doctorsController.getAll(req, res);
    } else if (url.pathname === '/appointments') {
        const appointmentsController = new AppointmentsController(new PatientsRepository(), new DoctorsRepository());
        appointmentsController.schedule(req, res);
    }

    res.statusCode = 404;
    res.end();
});

dotenv.config()

server.listen(process.env.PORT);
import dotenv from 'dotenv';
import { PatientsController } from './src/controllers/patients-controller.mjs';
import { DoctorsController } from './src/controllers/doctors-controller.mjs';
import { AppointmentsController } from './src/controllers/appointments-controller.mjs';
import { PatientsRepository } from './src/repositories/patients-repository.mjs';
import { DoctorsRepository } from './src/repositories/doctors-repository.mjs';
import { AppointmentsRepository } from './src/repositories/appointments-repository.mjs';
import { AppointmentsService } from './src/services/appointments-service.mjs';
import { Server } from './src/app/server.mjs';

const patientsRepository = new PatientsRepository();
const doctorsRepository = new DoctorsRepository();
const apointmentsRepository = new AppointmentsRepository();

const appointmentsService = new AppointmentsService(apointmentsRepository, patientsRepository, doctorsRepository)

const patientsController = new PatientsController(patientsRepository);
const doctorsController = new DoctorsController(doctorsRepository);
const appointmentsController = new AppointmentsController(appointmentsService);

const server = new Server(patientsController, doctorsController, appointmentsController);

dotenv.config()

server.listen(process.env.PORT);
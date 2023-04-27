import dotenv from 'dotenv';
import { PatientsController } from './src/controllers/patients-controller.mjs';
import { DoctorsController } from './src/controllers/doctors-controller.mjs';
import { AppointmentsController } from './src/controllers/appointments-controller.mjs';
import { PatientsRepository } from './src/repositories/patients-repository.mjs';
import { DoctorsRepository } from './src/repositories/doctors-repository.mjs';
import { AppointmentsRepository } from './src/repositories/appointments-repository.mjs';
import { AppointmentsService } from './src/services/appointments-service.mjs';
import { Server } from './src/app/server.mjs';
import { PatientsRoutes } from './src/routes/patients-routes.mjs';
import { DoctorsRoutes } from './src/routes/doctors-routes.mjs';
import { AppointmentsRoutes } from './src/routes/appointments-routes.mjs';
import { PatientsService } from './src/services/patients-service.mjs';

const patientsRepository = new PatientsRepository();
const doctorsRepository = new DoctorsRepository();
const apointmentsRepository = new AppointmentsRepository();

const appointmentsService = new AppointmentsService(apointmentsRepository, patientsRepository, doctorsRepository);
const patientsService = new PatientsService(patientsRepository);

const patientsController = new PatientsController(patientsService);
const doctorsController = new DoctorsController(doctorsRepository);
const appointmentsController = new AppointmentsController(appointmentsService);

const patientsRoutes = new PatientsRoutes(patientsController);
const doctorsRoutes = new DoctorsRoutes(doctorsController);
const appointmentsRoutes = new AppointmentsRoutes(appointmentsController);

const server = new Server(patientsRoutes, doctorsRoutes, appointmentsRoutes);

dotenv.config()

server.listen(process.env.PORT);
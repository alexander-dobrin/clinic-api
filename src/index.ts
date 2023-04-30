import dotenv from 'dotenv';
import { PatientsController } from './controllers/patients-controller';
import { DoctorsController } from './controllers/doctors-controller';
import { AppointmentsController } from './controllers/appointments-controller';
import { PatientsRepository } from './repositories/patients-repository';
import { DoctorsRepository } from './repositories/doctors-repository';
import { AppointmentsRepository } from './repositories/appointments-repository';
import { AppointmentsService } from './services/appointments-service';
import { Server } from './server';
import { PatientsRoutes } from './routes/patients-routes';
import { DoctorsRoutes } from './routes/doctors-routes';
import { AppointmentsRoutes } from './routes/appointments-routes';
import { PatientsService } from './services/patients-service';
import { DoctorsService } from './services/doctors-service';

const patientsRepository = new PatientsRepository();
const doctorsRepository = new DoctorsRepository();
const apointmentsRepository = new AppointmentsRepository();

const patientsService = new PatientsService(patientsRepository);
const doctorsService = new DoctorsService(doctorsRepository);
const appointmentsService = new AppointmentsService(apointmentsRepository, patientsService, doctorsService);

const patientsController = new PatientsController(patientsService);
const doctorsController = new DoctorsController(doctorsService);
const appointmentsController = new AppointmentsController(appointmentsService);

const patientsRoutes = new PatientsRoutes(patientsController);
const doctorsRoutes = new DoctorsRoutes(doctorsController);
const appointmentsRoutes = new AppointmentsRoutes(appointmentsController);

const server = new Server(patientsRoutes, doctorsRoutes, appointmentsRoutes);

dotenv.config()

server.listen(process.env.PORT);
import dotenv from 'dotenv';
import * as path from 'path';
import PatientsController from './controllers/patients-controller';
import DoctorsController from './controllers/doctors-controller';
import AppointmentsController from './controllers/appointments-controller';
import PatientsRepository from './repositories/patients-repository';
import DoctorsRepository from './repositories/doctors-repository';
import AppointmentsRepository from './repositories/appointments-repository';
import AppointmentsService from './services/appointments-service';
import Server from './server';
import PatientsRoutes from './routes/patients-routes';
import DoctorsRoutes from './routes/doctors-routes';
import AppointmentsRoutes from './routes/appointments-routes';
import PatientsService from './services/patients-service';
import DoctorsService from './services/doctors-service';
import FileDataProvider from './providers/file-data-provider';
import { ServiceEventEmitter } from './services/service-event-emitter';
import ModelsCoordinationService from './services/models-coordination-service';
import { ExceptionFilter } from './errors/exception-filter';

const patientsRepository = new PatientsRepository(new FileDataProvider(path.resolve('assets', 'patients.json')));
const doctorsRepository = new DoctorsRepository(new FileDataProvider(path.resolve('assets', 'doctors.json')));
const apointmentsRepository = new AppointmentsRepository(new FileDataProvider(path.resolve('assets', 'appointments.json')));

const serviceCommonEvents = new ServiceEventEmitter();

const patientsService = new PatientsService(patientsRepository);
const doctorsService = new DoctorsService(doctorsRepository, serviceCommonEvents);
const appointmentsService = new AppointmentsService(apointmentsRepository, patientsService, doctorsService, serviceCommonEvents);

new ModelsCoordinationService(serviceCommonEvents, doctorsService, appointmentsService);

const patientsController = new PatientsController(patientsService);
const doctorsController = new DoctorsController(doctorsService);
const appointmentsController = new AppointmentsController(appointmentsService);

const patientsRoutes = new PatientsRoutes(patientsController);
const doctorsRoutes = new DoctorsRoutes(doctorsController);
const appointmentsRoutes = new AppointmentsRoutes(appointmentsController);

const errFilter = new ExceptionFilter();

const server = new Server(patientsRoutes, doctorsRoutes, appointmentsRoutes, errFilter);

dotenv.config()

server.listen(process.env.PORT);
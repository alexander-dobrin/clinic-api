import dotenv from 'dotenv';
import App from './app';
import { ServiceEventEmitter } from './services/service-event-emitter';
import { ExceptionFilter } from './errors/exception-filter';
import { Container } from 'inversify';
import { patientsModule } from './modules/patients-module';
import { doctorsModule } from './modules/doctors-module';
import { appointmentsModule } from './modules/appointments-module';
import { TYPES } from './types';
import 'reflect-metadata';

const iocContainer = new Container();
iocContainer.load(patientsModule);
iocContainer.load(doctorsModule);
iocContainer.load(appointmentsModule);

iocContainer.bind<ExceptionFilter>(TYPES.EXCEPTION_FILTER).to(ExceptionFilter);
iocContainer.bind<ServiceEventEmitter>(TYPES.EVENT_EMITTER).to(ServiceEventEmitter);

iocContainer.bind<App>(TYPES.APP).to(App);

const app = iocContainer.get<App>(TYPES.APP);

dotenv.config();
app.listen(process.env.PORT);


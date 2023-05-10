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
import ModelsCoordinationService from './services/models-coordination-service';

const iocContainer = new Container();
iocContainer.load(patientsModule);
iocContainer.load(doctorsModule);
iocContainer.load(appointmentsModule);

iocContainer.bind<ExceptionFilter>(TYPES.EXCEPTION_FILTER).to(ExceptionFilter).inSingletonScope();
iocContainer.bind<ServiceEventEmitter>(TYPES.EVENT_EMITTER).to(ServiceEventEmitter).inSingletonScope();
iocContainer.bind<ModelsCoordinationService>(TYPES.MODELS_COORDINATION_SERVICE).to(ModelsCoordinationService).inSingletonScope();

iocContainer.bind<App>(TYPES.APP).to(App);

const coordService = iocContainer.get(TYPES.MODELS_COORDINATION_SERVICE);

const app = iocContainer.get<App>(TYPES.APP);

dotenv.config();
app.listen(process.env.PORT);


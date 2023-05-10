import dotenv from 'dotenv';
import App from './app';
import { ServiceEventEmitter } from './common/services/service-event-emitter';
import { ExceptionFilter } from './common/middlewares/exception-filter';
import { Container } from 'inversify';
import { patientsModule } from './patients/patients-module';
import { doctorsModule } from './doctors/doctors-module';
import { appointmentsModule } from './appointments/appointments-module';
import { CONTAINER_TYPES } from './common/constants';
import 'reflect-metadata';
import ModelsCoordinationService from './common/services/models-coordination-service';

const iocContainer = new Container();
iocContainer.load(patientsModule);
iocContainer.load(doctorsModule);
iocContainer.load(appointmentsModule);

iocContainer.bind<ExceptionFilter>(CONTAINER_TYPES.EXCEPTION_FILTER).to(ExceptionFilter).inSingletonScope();
iocContainer.bind<ServiceEventEmitter>(CONTAINER_TYPES.EVENT_EMITTER).to(ServiceEventEmitter).inSingletonScope();
iocContainer.bind<ModelsCoordinationService>(CONTAINER_TYPES.MODELS_COORDINATION_SERVICE).to(ModelsCoordinationService).inSingletonScope();

iocContainer.bind<App>(CONTAINER_TYPES.APP).to(App);

const coordService = iocContainer.get(CONTAINER_TYPES.MODELS_COORDINATION_SERVICE);
const app = iocContainer.get<App>(CONTAINER_TYPES.APP);

dotenv.config();
app.listen(process.env.PORT);


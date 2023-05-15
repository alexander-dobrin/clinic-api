import App from './app';
import { ExceptionFilter } from './common/middlewares/exception-filter';
import { Container } from 'inversify';
import { patientsModule } from './patients/patients-module';
import { doctorsModule } from './doctors/doctors-module';
import { appointmentsModule } from './appointments/appointments-module';
import { CONTAINER_TYPES } from './common/constants';
import { authModule } from './auth/auth-module';
import { userModule } from './users/user-module';

export const iocContainer = new Container();

iocContainer.load(userModule);
iocContainer.load(authModule);
iocContainer.load(patientsModule);
iocContainer.load(doctorsModule);
iocContainer.load(appointmentsModule);

iocContainer.bind<ExceptionFilter>(CONTAINER_TYPES.EXCEPTION_FILTER)
    .to(ExceptionFilter)
    .inSingletonScope();
    
iocContainer.bind<App>(CONTAINER_TYPES.APP).to(App);
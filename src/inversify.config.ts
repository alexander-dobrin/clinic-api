import { App } from './app';
import { ExceptionFilter } from './common/middlewares/exception-filter';
import { Container } from 'inversify';
import { patientModule } from './patient/patient-module';
import { doctorModule } from './doctor/doctor-module';
import { appointmentModule } from './appointment/appointment-module';
import { CONTAINER_TYPES } from './common/constants';
import { authModule } from './auth/auth-module';
import { userModule } from './user/user-module';
import { AuthMiddleware } from './auth/auth-middleware';

export const iocContainer = new Container();

iocContainer.load(userModule);
iocContainer.load(authModule);
iocContainer.load(patientModule);
iocContainer.load(doctorModule);
iocContainer.load(appointmentModule);

iocContainer
	.bind<ExceptionFilter>(CONTAINER_TYPES.EXCEPTION_FILTER)
	.to(ExceptionFilter)
	.inSingletonScope();

iocContainer
	.bind<AuthMiddleware>(CONTAINER_TYPES.AUTH_MIDDLEWARE)
	.to(AuthMiddleware)
	.inSingletonScope();

iocContainer.bind<App>(CONTAINER_TYPES.APP).to(App);

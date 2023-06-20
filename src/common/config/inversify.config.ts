import { App } from '../../app';
import { ErrorFilterMiddleware } from '../../common/middleware/error-filter-middleware';
import { Container } from 'inversify';
import { patientModule } from '../../patient/patient-module';
import { doctorModule } from '../../doctor/doctor-module';
import { appointmentModule } from '../../appointment/appointment-module';
import { CONTAINER_TYPES } from '../../common/constants';
import { authModule } from '../../auth/auth-module';
import { userModule } from '../../user/user-module';
import { AuthMiddleware } from '../../auth/auth-middleware';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../db/typeorm.config';
import { tokenModule } from '../../token/token-module';

export const iocContainer = new Container();

iocContainer
	.bind<DataSource>(CONTAINER_TYPES.DB_CONNECTION)
	.toDynamicValue(() => AppDataSource)
	.inSingletonScope();

iocContainer.load(tokenModule);
iocContainer.load(userModule);
iocContainer.load(authModule);
iocContainer.load(patientModule);
iocContainer.load(doctorModule);
iocContainer.load(appointmentModule);

iocContainer
	.bind<ErrorFilterMiddleware>(CONTAINER_TYPES.ERROR_FILTER_MIDDLEWARE)
	.to(ErrorFilterMiddleware)
	.inSingletonScope();

iocContainer
	.bind<AuthMiddleware>(CONTAINER_TYPES.AUTH_MIDDLEWARE)
	.to(AuthMiddleware)
	.inSingletonScope();

iocContainer.bind<App>(CONTAINER_TYPES.APP).to(App);

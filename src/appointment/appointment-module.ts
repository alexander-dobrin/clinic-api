import { ContainerModule, interfaces } from 'inversify';
import { IRoutes } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import { IHttpController } from '../common/types';
import { AppointmentRoutes } from './appointment-routes';
import { AppointmentController } from './appointment-controller';
import { AppointmentService } from './appointment-service';
import { AppointmentRepository } from './appointment-repository';
import { iocContainer } from '../common/config/inversify.config';
import { DataSource } from 'typeorm';

export const appointmentModule = new ContainerModule((bind: interfaces.Bind) => {
	bind<IRoutes>(CONTAINER_TYPES.APPOINTMENT_ROUTES).to(AppointmentRoutes).inSingletonScope();
	bind<IHttpController>(CONTAINER_TYPES.APPOINTMENT_CONTROLLER)
		.to(AppointmentController)
		.inSingletonScope();
	bind<AppointmentService>(CONTAINER_TYPES.APPOINTMENT_SERVICE)
		.to(AppointmentService)
		.inSingletonScope();
	bind<AppointmentRepository>(CONTAINER_TYPES.APPOINTMENT_REPOSITORY)
		.toDynamicValue(() => {
			const provider = iocContainer.get<DataSource>(CONTAINER_TYPES.DB_CONNECTION);
			return new AppointmentRepository(provider);
		})
		.inSingletonScope();
});

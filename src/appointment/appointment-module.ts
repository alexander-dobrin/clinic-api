import { ContainerModule, interfaces } from 'inversify';
import { IRoutes } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import { IHttpController } from '../common/types';
import { IRepository } from '../common/types';
import AppointmentRoutes from './appointment-routes';
import AppointmentController from './appointment-controller';
import AppointmentService from './appointment-service';
import AppointmentModel from './appointment-model';
import AppointmentRepository from './appointment-repository';
import { IDataProvider } from '../common/types';
import FileDataProvider from '../common/providers/file-data-provider';
import * as path from 'path';

export const appointmentModule = new ContainerModule((bind: interfaces.Bind) => {
	bind<IRoutes>(CONTAINER_TYPES.APPOINTMENTS_ROUTES).to(AppointmentRoutes).inSingletonScope();
	bind<IHttpController>(CONTAINER_TYPES.APPOINTMENTS_CONTROLLER)
		.to(AppointmentController)
		.inSingletonScope();
	bind<AppointmentService>(CONTAINER_TYPES.APPOINTMENTS_SERVICE)
		.to(AppointmentService)
		.inSingletonScope();
	bind<IRepository<AppointmentModel>>(CONTAINER_TYPES.APPOINTMENTS_REPOSITORY)
		.to(AppointmentRepository)
		.inSingletonScope();
	bind<IDataProvider<AppointmentModel>>(CONTAINER_TYPES.APPOINTMENTS_DATA_PROVIDER)
		.toDynamicValue(() => {
			return new FileDataProvider(path.resolve('assets', 'appointments.json'));
		})
		.inSingletonScope();
});

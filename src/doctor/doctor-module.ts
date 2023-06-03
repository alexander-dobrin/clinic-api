import { ContainerModule, interfaces } from 'inversify';
import { IRoutes } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import { IHttpController } from '../common/types';
import { DoctorService } from './doctor-service';
import { DoctorRepository } from './doctor-repository';
import { DoctorController } from './doctor-controller';
import { DoctorRoutes } from './doctor-routes';
import { DataSource } from 'typeorm';
import { iocContainer } from '../inversify.config';

export const doctorModule = new ContainerModule((bind: interfaces.Bind) => {
	bind<IRoutes>(CONTAINER_TYPES.DOCTORS_ROUTES).to(DoctorRoutes).inSingletonScope();
	bind<IHttpController>(CONTAINER_TYPES.DOCTORS_CONTROLLER).to(DoctorController).inSingletonScope();
	bind<DoctorService>(CONTAINER_TYPES.DOCTORS_SERVICE).to(DoctorService).inSingletonScope();
	bind<DoctorRepository>(CONTAINER_TYPES.DOCTORS_REPOSITORY)
		.toDynamicValue(() => {
			const provider = iocContainer.get<DataSource>(CONTAINER_TYPES.DB_CONNECTION);
			return new DoctorRepository(provider);
		})
		.inSingletonScope();
});

import { ContainerModule, interfaces } from 'inversify';
import { IRoutes } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import { IHttpController } from '../common/types';
import { DoctorService } from './doctor-service';
import { DoctorController } from './doctor-controller';
import { DoctorRoutes } from './doctor-routes';

export const doctorModule = new ContainerModule((bind: interfaces.Bind) => {
	bind<IRoutes>(CONTAINER_TYPES.DOCTOR_ROUTES).to(DoctorRoutes).inSingletonScope();
	bind<IHttpController>(CONTAINER_TYPES.DOCTOR_CONTROLLER).to(DoctorController).inSingletonScope();
	bind<DoctorService>(CONTAINER_TYPES.DOCTOR_SERVICE).to(DoctorService).inSingletonScope();
});

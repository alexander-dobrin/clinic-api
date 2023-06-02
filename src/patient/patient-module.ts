import { ContainerModule, interfaces } from 'inversify';
import { IRoutes } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import { PatientRoutes } from './patient-routes';
import { PatientController } from './patient-controller';
import { IHttpController } from '../common/types';
import { PatientService } from './patient-service';
import { PatientRepository } from './patient-repository';
import { iocContainer } from '../inversify.config';
import { DataSource } from 'typeorm';

export const patientModule = new ContainerModule((bind: interfaces.Bind) => {
	bind<IRoutes>(CONTAINER_TYPES.PATIENTS_ROUTES).to(PatientRoutes).inSingletonScope();
	bind<IHttpController>(CONTAINER_TYPES.PATIENTS_CONTROLLER)
		.to(PatientController)
		.inSingletonScope();
	bind<PatientService>(CONTAINER_TYPES.PATIENTS_SERVICE).to(PatientService).inSingletonScope();
	bind<PatientRepository>(CONTAINER_TYPES.PATIENTS_REPOSITORY)
		.toDynamicValue(() =>{
			const provider = iocContainer.get<DataSource>(CONTAINER_TYPES.DB_CONNECTION);
			return new PatientRepository(provider);
		})
		.inSingletonScope();
});

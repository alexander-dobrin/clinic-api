import { ContainerModule, interfaces } from 'inversify';
import { IRoutes } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import PatientRoutes from './patient-routes';
import PatientController from './patient-controller';
import { IHttpController } from '../common/types';
import PatientService from './patient-service';
import { IRepository } from '../common/types';
import PatientRepository from './patient-repository';
import PatientModel from './patient-model';
import { IDataProvider } from '../common/types';
import FileDataProvider from '../common/providers/file-data-provider';
import * as path from 'path';

export const patientModule = new ContainerModule((bind: interfaces.Bind) => {
	bind<IRoutes>(CONTAINER_TYPES.PATIENTS_ROUTES).to(PatientRoutes).inSingletonScope();
	bind<IHttpController>(CONTAINER_TYPES.PATIENTS_CONTROLLER)
		.to(PatientController)
		.inSingletonScope();
	bind<PatientService>(CONTAINER_TYPES.PATIENTS_SERVICE).to(PatientService).inSingletonScope();
	bind<IRepository<PatientModel>>(CONTAINER_TYPES.PATIENTS_REPOSITORY)
		.to(PatientRepository)
		.inSingletonScope();
	bind<IDataProvider<PatientModel>>(CONTAINER_TYPES.PATIENTS_DATA_PROVIDER)
		.toDynamicValue(() => {
			return new FileDataProvider(path.resolve('assets', 'patients.json'));
		})
		.inSingletonScope();
});

import { ContainerModule, interfaces } from 'inversify';
import { IRoutes } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import { PatientRoutes } from './patient-routes';
import { PatientController } from './patient-controller';
import { IHttpController } from '../common/types';
import { PatientService } from './patient-service';

export const patientModule = new ContainerModule((bind: interfaces.Bind) => {
	bind<IRoutes>(CONTAINER_TYPES.PATIENT_ROUTES).to(PatientRoutes).inSingletonScope();
	bind<IHttpController>(CONTAINER_TYPES.PATIENT_CONTROLLER)
		.to(PatientController)
		.inSingletonScope();
	bind<PatientService>(CONTAINER_TYPES.PATIENT_SERVICE).to(PatientService).inSingletonScope();
});

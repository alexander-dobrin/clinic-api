import { ContainerModule, interfaces } from "inversify";
import { IRoutes } from "../common/types";
import { CONTAINER_TYPES } from "../common/constants";
import PatientsRoutes from "./patients-routes";
import PatientsController from "./patients-controller";
import { IHttpController } from "../common/types";
import { IPatientsService } from "./patients-service-interface";
import PatientsService from "./patients-service";
import { IRepository } from "../common/types";
import PatientsRepository from "./patients-repository";
import PatientModel from "./patient-model";

import { IDataProvider } from "../common/types";
import FileDataProvider from "../common/providers/file-data-provider";
import * as path from 'path';

export const patientsModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<IRoutes>(CONTAINER_TYPES.PATIENTS_ROUTES).to(PatientsRoutes).inSingletonScope();
    bind<IHttpController>(CONTAINER_TYPES.PATIENTS_CONTROLLER).to(PatientsController).inSingletonScope();
    bind<IPatientsService>(CONTAINER_TYPES.PATIENTS_SERVICE).to(PatientsService).inSingletonScope();
    bind<IRepository<PatientModel>>(CONTAINER_TYPES.PATIENTS_REPOSITORY).to(PatientsRepository).inSingletonScope();
    bind<IDataProvider<PatientModel>>(CONTAINER_TYPES.PATIENTS_DATA_PROVIDER).toDynamicValue((context: interfaces.Context) => {
        return new FileDataProvider(path.resolve('assets', 'patients.json'))
    }).inSingletonScope();
});
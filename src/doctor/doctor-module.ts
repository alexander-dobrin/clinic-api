import { ContainerModule, interfaces } from "inversify";
import { IRoutes } from "../common/types";
import { CONTAINER_TYPES } from "../common/constants";
import { IHttpController } from "../common/types";
import { IRepository } from "../common/types";
import DoctorService from "./doctor-service";
import DoctorModel from "./doctor-model";
import DoctorRepository from "./doctor-repository";
import DoctorController from "./doctor-controller";
import DoctorRoutes from "./doctor-routes";
import { IDataProvider } from "../common/types";
import FileDataProvider from "../common/providers/file-data-provider";
import * as path from 'path';

export const doctorModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<IRoutes>(CONTAINER_TYPES.DOCTORS_ROUTES).to(DoctorRoutes).inSingletonScope();
    bind<IHttpController>(CONTAINER_TYPES.DOCTORS_CONTROLLER).to(DoctorController).inSingletonScope();
    bind<DoctorService>(CONTAINER_TYPES.DOCTORS_SERVICE).to(DoctorService).inSingletonScope();
    bind<IRepository<DoctorModel>>(CONTAINER_TYPES.DOCTORS_REPOSITORY).to(DoctorRepository).inSingletonScope();
    bind<IDataProvider<DoctorModel>>(CONTAINER_TYPES.DOCTORS_DATA_PROVIDER).toDynamicValue((context: interfaces.Context) => {
        return new FileDataProvider(path.resolve('assets', 'doctors.json'))
    }).inSingletonScope();
});
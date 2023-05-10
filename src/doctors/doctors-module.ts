import { ContainerModule, interfaces } from "inversify";
import { IRoutes } from "../common/types";
import { CONTAINER_TYPES } from "../common/constants";
import { IHttpController } from "../common/types";
import { IRepository } from "../common/types";
import { IDoctorsService } from "./doctors-service-interface";
import DoctorsService from "./doctors-service";
import DoctorModel from "./doctor-model";
import DoctorsRepository from "./doctors-repository";
import DoctorsController from "./doctors-controller";
import DoctorsRoutes from "./doctors-routes";
import 'reflect-metadata';
import { IDataProvider } from "../common/types";
import FileDataProvider from "../common/providers/file-data-provider";
import * as path from 'path';

export const doctorsModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<IRoutes>(CONTAINER_TYPES.DOCTORS_ROUTES).to(DoctorsRoutes).inSingletonScope();
    bind<IHttpController>(CONTAINER_TYPES.DOCTORS_CONTROLLER).to(DoctorsController).inSingletonScope();
    bind<IDoctorsService>(CONTAINER_TYPES.DOCTORS_SERVICE).to(DoctorsService).inSingletonScope();
    bind<IRepository<DoctorModel>>(CONTAINER_TYPES.DOCTORS_REPOSITORY).to(DoctorsRepository).inSingletonScope();
    bind<IDataProvider<DoctorModel>>(CONTAINER_TYPES.DOCTORS_DATA_PROVIDER).toDynamicValue((context: interfaces.Context) => {
        return new FileDataProvider(path.resolve('assets', 'doctors.json'))
    }).inSingletonScope();
});
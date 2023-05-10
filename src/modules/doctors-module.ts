import { ContainerModule, interfaces } from "inversify";
import { IRoutes } from "../routes/routes-interface";
import { TYPES } from "../types";
import { IHttpController } from "../controllers/http-controller-interface";
import { IRepository } from "../repositories/repository-interface";
import { IDoctorsService } from "../services/abstract/doctors-service-interface";
import DoctorsService from "../services/doctors-service";
import DoctorModel from "../models/doctor-model";
import DoctorsRepository from "../repositories/doctors-repository";
import DoctorsController from "../controllers/doctors-controller";
import DoctorsRoutes from "../routes/doctors-routes";
import 'reflect-metadata';
import IDataProvider from "../providers/abstract/data-provider-interface";
import FileDataProvider from "../providers/file-data-provider";
import * as path from 'path';

export const doctorsModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<IRoutes>(TYPES.DOCTORS_ROUTES).to(DoctorsRoutes).inSingletonScope();
    bind<IHttpController>(TYPES.DOCTORS_CONTROLLER).to(DoctorsController).inSingletonScope();
    bind<IDoctorsService>(TYPES.DOCTORS_SERVICE).to(DoctorsService).inSingletonScope();
    bind<IRepository<DoctorModel>>(TYPES.DOCTORS_REPOSITORY).to(DoctorsRepository).inSingletonScope();
    bind<IDataProvider<DoctorModel>>(TYPES.DOCTORS_DATA_PROVIDER).toDynamicValue((context: interfaces.Context) => {
        return new FileDataProvider(path.resolve('assets', 'doctors.json'))
    }).inSingletonScope();
});
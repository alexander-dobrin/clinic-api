import { ContainerModule, interfaces } from "inversify";
import { IRoutes } from "../routes/routes-interface";
import { TYPES } from "../types";
import PatientsRoutes from "../routes/patients-routes";
import PatientsController from "../controllers/patients-controller";
import { IHttpController } from "../controllers/http-controller-interface";
import { IPatientsService } from "../services/abstract/patients-service-interface";
import PatientsService from "../services/patients-service";
import { IRepository } from "../repositories/repository-interface";
import PatientsRepository from "../repositories/patients-repository";
import PatientModel from "../models/patient-model";
import 'reflect-metadata';
import IDataProvider from "../providers/abstract/data-provider-interface";
import FileDataProvider from "../providers/file-data-provider";
import * as path from 'path';

export const patientsModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<IRoutes>(TYPES.PATIENTS_ROUTES).to(PatientsRoutes);
    bind<IHttpController>(TYPES.PATIENTS_CONTROLLER).to(PatientsController);
    bind<IPatientsService>(TYPES.PATIENTS_SERVICE).to(PatientsService);
    bind<IRepository<PatientModel>>(TYPES.PATIENTS_REPOSITORY).to(PatientsRepository);
    bind<IDataProvider<PatientModel>>(TYPES.PATIENTS_DATA_PROVIDER).toDynamicValue((context: interfaces.Context) => {
        return new FileDataProvider(path.resolve('assets', 'patients.json'))
    });
});
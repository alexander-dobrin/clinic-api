import { ContainerModule, interfaces } from "inversify";
import { IRoutes } from "../routes/routes-interface";
import { TYPES } from "../types";
import { IHttpController } from "../controllers/http-controller-interface";
import { IRepository } from "../repositories/repository-interface";
import AppointmentsRoutes from "../routes/appointments-routes";
import AppointmentsController from "../controllers/appointments-controller";
import AppointmentsService from "../services/appointments-service";
import AppointmentModel from "../models/appointment-model";
import AppointmentsRepository from "../repositories/appointments-repository";
import { IAppointmentsService } from "../services/abstract/appointments-service-interface";
import 'reflect-metadata';
import IDataProvider from "../providers/abstract/data-provider-interface";
import FileDataProvider from "../providers/file-data-provider";
import * as path from 'path';

export const appointmentsModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<IRoutes>(TYPES.APPOINTMENTS_ROUTES).to(AppointmentsRoutes).inSingletonScope();
    bind<IHttpController>(TYPES.APPOINTMENTS_CONTROLLER).to(AppointmentsController).inSingletonScope();
    bind<IAppointmentsService>(TYPES.APPOINTMENTS_SERVICE).to(AppointmentsService).inSingletonScope();
    bind<IRepository<AppointmentModel>>(TYPES.APPOINTMENTS_REPOSITORY).to(AppointmentsRepository).inSingletonScope();
    bind<IDataProvider<AppointmentModel>>(TYPES.APPOINTMENTS_DATA_PROVIDER).toDynamicValue((context: interfaces.Context) => {
      return new FileDataProvider(path.resolve('assets', 'appointments.json'))
  }).inSingletonScope();
});
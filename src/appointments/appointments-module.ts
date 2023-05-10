import { ContainerModule, interfaces } from "inversify";
import { IRoutes } from "../common/types";
import { CONTAINER_TYPES } from "../common/constants";
import { IHttpController } from "../common/types";
import { IRepository } from "../common/types";
import AppointmentsRoutes from "./appointments-routes";
import AppointmentsController from "./appointments-controller";
import AppointmentsService from "./appointments-service";
import AppointmentModel from "./appointment-model";
import AppointmentsRepository from "./appointments-repository";
import { IAppointmentsService } from "./appointments-service-interface";
import 'reflect-metadata';
import { IDataProvider } from "../common/types";
import FileDataProvider from "../common/providers/file-data-provider";
import * as path from 'path';

export const appointmentsModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<IRoutes>(CONTAINER_TYPES.APPOINTMENTS_ROUTES).to(AppointmentsRoutes).inSingletonScope();
    bind<IHttpController>(CONTAINER_TYPES.APPOINTMENTS_CONTROLLER).to(AppointmentsController).inSingletonScope();
    bind<IAppointmentsService>(CONTAINER_TYPES.APPOINTMENTS_SERVICE).to(AppointmentsService).inSingletonScope();
    bind<IRepository<AppointmentModel>>(CONTAINER_TYPES.APPOINTMENTS_REPOSITORY).to(AppointmentsRepository).inSingletonScope();
    bind<IDataProvider<AppointmentModel>>(CONTAINER_TYPES.APPOINTMENTS_DATA_PROVIDER).toDynamicValue((context: interfaces.Context) => {
      return new FileDataProvider(path.resolve('assets', 'appointments.json'))
  }).inSingletonScope();
});
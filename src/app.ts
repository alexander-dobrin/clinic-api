import express, { Express } from 'express';
import { ExceptionFilter } from './common/middlewares/exception-filter';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { CONTAINER_TYPES } from './common/constants';
import { IRoutes } from './common/types';

@injectable()
export default class App {
    private readonly app: Express;

    constructor(
        @inject(CONTAINER_TYPES.PATIENTS_ROUTES) private readonly patientsRoutes: IRoutes, 
        @inject(CONTAINER_TYPES.DOCTORS_ROUTES) private readonly doctorsRoutes: IRoutes, 
        @inject(CONTAINER_TYPES.APPOINTMENTS_ROUTES) private readonly appointmentsRoutes: IRoutes,
        @inject(CONTAINER_TYPES.AUTH_ROUTES) private readonly authRoutes: IRoutes,
        @inject(CONTAINER_TYPES.USER_ROUTES) private readonly userRoutes: IRoutes,
        @inject(CONTAINER_TYPES.EXCEPTION_FILTER) private readonly exceptionFilter: ExceptionFilter
    ) {
        this.app = express();

        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorFilters();
    }

    private setupMiddlewares(): void {
        this.app.use(express.json());
    }

    private setupErrorFilters(): void {
        this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
    }

    private setupRoutes(): void {
        this.app.use('/patients', this.patientsRoutes.router);
        this.app.use('/doctors', this.doctorsRoutes.router);
        this.app.use('/appointments', this.appointmentsRoutes.router);
        this.app.use('/', this.authRoutes.router);
        this.app.use('/users', this.userRoutes.router);
    }

    public listen(port): void {
        this.app.listen(port);
    }
}
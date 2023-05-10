import express, { Express } from 'express';
import { ExceptionFilter } from './errors/exception-filter';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { TYPES } from './types';
import { IRoutes } from './routes/routes-interface';

@injectable()
export default class App {
    private readonly app: Express;

    constructor(
        @inject(TYPES.PATIENTS_ROUTES) private readonly patientsRoutes: IRoutes, 
        @inject(TYPES.DOCTORS_ROUTES) private readonly doctorsRoutes: IRoutes, 
        @inject(TYPES.APPOINTMENTS_ROUTES) private readonly appointmentsRoutes: IRoutes,
        @inject(TYPES.EXCEPTION_FILTER) private readonly exceptionFilter: ExceptionFilter
    ) {
        this.app = express();

        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorFilters();
    }

    private setupMiddlewares(): void {
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
    }

    private setupErrorFilters(): void {
        this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
    }

    private setupRoutes(): void {
        this.app.use('/patients', this.patientsRoutes.router);
        this.app.use('/doctors', this.doctorsRoutes.router);
        this.app.use('/appointments', this.appointmentsRoutes.router);
    }

    public listen(port): void {
        this.app.listen(port);
    }
}
import express, { Express } from 'express';
import PatientsRoutes from './routes/patients-routes';
import DoctorsRoutes from './routes/doctors-routes';
import AppointmentsRoutes from './routes/appointments-routes';
import { ExceptionFilter } from './errors/exception-filter';

export default class Server {
    private readonly patientsRoutes: PatientsRoutes;
    private readonly doctorsRoutes: DoctorsRoutes;
    private readonly appointmentsRoutes: AppointmentsRoutes;
    private readonly app: Express;
    private readonly exceptionFilter: ExceptionFilter;

    constructor(
        patientsRoutes: PatientsRoutes, 
        doctorsRoutes: DoctorsRoutes, 
        appointmentsRoutes: AppointmentsRoutes,
        exceptionFilter: ExceptionFilter) {
        this.patientsRoutes = patientsRoutes;
        this.doctorsRoutes = doctorsRoutes;
        this.appointmentsRoutes = appointmentsRoutes;
        this.exceptionFilter = exceptionFilter;

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
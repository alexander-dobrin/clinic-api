import express, { Express, Request, Response, ErrorRequestHandler, NextFunction } from 'express';
import { InvalidParameterError } from './errors/invalid-parameter-error';
import { DuplicateEntityError } from './errors/duplicate-entity-error';
import PatientsRoutes from './routes/patients-routes';
import DoctorsRoutes from './routes/doctors-routes';
import AppointmentsRoutes from './routes/appointments-routes';
import { AppointmentConflictError } from './errors/appointment-conflict-error';
import { StatusCodes } from './enums/status-codes';

export default class Server {
    private readonly patientsRoutes: PatientsRoutes;
    private readonly doctorsRoutes: DoctorsRoutes;
    private readonly appointmentsRoutes: AppointmentsRoutes;
    private readonly app: Express;

    constructor(patientsRoutes: PatientsRoutes, doctorsRoutes: DoctorsRoutes, appointmentsRoutes: AppointmentsRoutes) {
        this.patientsRoutes = patientsRoutes;
        this.doctorsRoutes = doctorsRoutes;
        this.appointmentsRoutes = appointmentsRoutes;

        this.app = express();

        this.setupMiddlewares();
        this.setupRoutes();
    }

    private setupMiddlewares(): void {
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
    }

    private setupRoutes(): void {
        this.app.use('/patients', this.patientsRoutes.router);
        this.app.use('/doctors', this.doctorsRoutes.router);
        this.app.use('/appointments', this.appointmentsRoutes.router);

        this.app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
            if (
                err instanceof InvalidParameterError ||
                err instanceof DuplicateEntityError
            ) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: { message: err.message } });
                return;
            } else if (err instanceof AppointmentConflictError) {
                res.status(StatusCodes.CONFLICT).json({ error: { message: err.message } });
                return;
            }
            console.log(err);
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    }

    public listen(port): void {
        this.app.listen(port);
    }
}
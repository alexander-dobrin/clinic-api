import express, { Express, Request, Response, ErrorRequestHandler, NextFunction } from 'express';
import { STATUS_CODES } from './enums';
import { MissingParameterError } from './exceptions/missing-parameter-error';
import { InvalidParameterError } from './exceptions/invalid-parameter-error';
import { DuplicateEntityError } from './exceptions/duplicate-entity-error';
import PatientsRoutes from './routes/patients-routes';
import { DoctorsRoutes } from './routes/doctors-routes';
import { AppointmentsRoutes } from './routes/appointments-routes';

export default class Server {
    private readonly patientsRoutes: PatientsRoutes;
    private readonly doctorsRoutes: DoctorsRoutes;
    private readonly appointmentsRoutes: AppointmentsRoutes;
    private readonly app: express.Express;

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
                err instanceof MissingParameterError ||
                err instanceof InvalidParameterError ||
                err instanceof DuplicateEntityError
            ) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ error: { message: err.message } });
                return;
            }
            console.log(err);
            res.sendStatus(STATUS_CODES.INTERNAL_SERVER_ERROR);
        });
    }

    public listen(port): void {
        this.app.listen(port);
    }
}
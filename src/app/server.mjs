import express from 'express';
import { STATUS_CODES } from '../enums.mjs';

export class Server {
    constructor(patientsRoutes, doctorsRoutes, appointmentsRoutes) {
        this.patientsRoutes = patientsRoutes;
        this.doctorsRoutes = doctorsRoutes;
        this.appointmentsRoutes = appointmentsRoutes;

        this.app = express();

        this.useMiddlewares();
        this.useRoutes();
    }

    useMiddlewares() {
        this.app.use(express.urlencoded({ extended: true }));
    }

    useRoutes() {
        this.app.use('/patients', this.patientsRoutes.router);
        this.app.use('/doctors', this.doctorsRoutes.router);
        this.app.use('/appointments', this.appointmentsRoutes.router);

        this.app.use((req, res, next) => {
            const error = new Error('Not found');
            error.status = STATUS_CODES.NOT_FOUND;
            next(error);
        });

        this.app.use((error, req, res, next) => {
            res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR);
            res.json({
                error: {
                    message: error.message
                }
            });
        });
    }

    listen(port) {
        this.app.listen(port);
    }
}
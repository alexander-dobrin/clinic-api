import express from 'express';

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
            error.status = 404;
            next(error);
        });

        this.app.use((error, req, res, next) => {
            res.status(error.status || 500);
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
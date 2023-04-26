import { Router } from 'express';

export class AppointmentsRoutes {
    constructor(appointmentsController) {
        this.appointmentsController = appointmentsController;
        this._router = Router();

        this._router.route('/')
            .get((req, res) => appointmentsController.get(req, res))
            .post((req, res) => appointmentsController.post(req, res));

        this._router.route('/:id')
            //.get((req, res) => appointmentsController.getById(req, res));
    }

    get router() {
        return this._router;
    }
}

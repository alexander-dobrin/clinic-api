import { Router } from 'express';

export class DoctorsRoutes {
    constructor(doctorsController) {
        this.patientsController = doctorsController;
        this._router = Router();

        this._router.get('/', (req, res) => doctorsController.get(req, res));

        this._router.route('/:id')
            .get((req, res) => doctorsController.getById(req, res));
    }

    get router() {
        return this._router;
    }
}
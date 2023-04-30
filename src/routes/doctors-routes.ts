import { Router } from 'express';

export class DoctorsRoutes {
    doctorsController;
    _router;
    
    constructor(doctorsController) {
        this.doctorsController = doctorsController;
        this._router = Router();

        this._router.route('/')
            .get((req, res) => doctorsController.get(req, res))
            .post((req, res) => doctorsController.post(req, res));

        this._router.route('/:id')
            .get((req, res) => doctorsController.getById(req, res))
            .put((req, res) => doctorsController.put(req, res))
            .delete((req, res) => doctorsController.delete(req, res));
    }

    get router() {
        return this._router;
    }
}
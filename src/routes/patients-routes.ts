import { Router } from 'express';

export class PatientsRoutes {
    patientsController;
    _router;
    
    constructor(patientsController) {
        this.patientsController = patientsController;
        this._router = Router();

        this.router.route('/')
            .get((req, res) => patientsController.get(req, res))
            .post((req, res) => patientsController.post(req, res));

        this._router.route('/:phone')
            .get((req, res) => patientsController.getByPhone(req, res))
            .put((req, res) => patientsController.put(req, res))
            .delete((req, res) => patientsController.delete(req, res));
    }

    get router() {
        return this._router;
    }
}
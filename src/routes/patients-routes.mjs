import { Router } from 'express';

export class PatientsRoutes {
    constructor(patientsController) {
        this.patientsController = patientsController;
        this._router = Router();

        this._router.get('/', (req, res) => patientsController.get(req, res));

        this._router.route('/:id')
            .get((req, res) => patientsController.getById(req, res));
    }

    get router() {
        return this._router;
    }
}

// patientsRouter.get('/', () => {
//     this.patientsController.getAll(req, res);
// });

// patientsRouter.get('/:id', () => {
//     this.patientsController.getOne(req, res);
// });

// patientsRouter.route('/:id')
//     .get()
//     .put();

// patientsRouter.param('id', (res, req, next, id) => {

// });
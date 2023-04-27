import { Router } from 'express';

export class PatientsRoutes {
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
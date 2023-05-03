import { Router } from 'express';
import PatientsController from '../controllers/patients-controller';
import DtoValidatorMiddleware from '../middlewares/dto-validator-middleware';
import CreatePatientDto from '../dto/patients/create-patient-dto';
import UpdatePatientDto from '../dto/patients/update-patient-dto';

export default class PatientsRoutes {
    private readonly _router = Router();
    private readonly patientsController: PatientsController;
    private readonly createValidator = new DtoValidatorMiddleware(CreatePatientDto);
    private readonly updateValidator = new DtoValidatorMiddleware(UpdatePatientDto);

    constructor(patientsController: PatientsController) {
        this.patientsController = patientsController;

        this.setupRoutes();
    }

    private setupRoutes(): void {
        this.router.route('/')
            .get(this.patientsController.get.bind(this.patientsController))
            .post(
                this.createValidator.validate.bind(this.createValidator),
                this.patientsController.post.bind(this.patientsController)
            );

        this._router.route('/:id')
            .get(this.patientsController.getById.bind(this.patientsController))
            .put(
                this.updateValidator.validate.bind(this.updateValidator),
                this.patientsController.put.bind(this.patientsController)
            )
            .delete(this.patientsController.delete.bind(this.patientsController));
    }

    get router(): Router {
        return this._router;
    }
}
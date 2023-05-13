import { Router } from 'express';
import DtoValidatorMiddleware from '../common/middlewares/dto-validator-middleware';
import CreatePatientDto from './dto/create-patient-dto';
import UpdatePatientDto from './dto/update-patient-dto';
import { IRoutes } from '../common/types';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { CONTAINER_TYPES } from '../common/constants';
import { IHttpController } from '../common/types';
import { QueryMapperMiddleware } from '../common/middlewares/query-mapper-middleware';

@injectable()
export default class PatientsRoutes implements IRoutes {
    private readonly _router = Router();
    private readonly createValidator = new DtoValidatorMiddleware(CreatePatientDto);
    private readonly updateValidator = new DtoValidatorMiddleware(UpdatePatientDto);
    private readonly mapQuery = new QueryMapperMiddleware();

    constructor(
        @inject(CONTAINER_TYPES.PATIENTS_CONTROLLER) private readonly patientsController: IHttpController
    ) {
        this.setupRoutes();
    }

    private setupRoutes(): void {
        this.router.route('/')
            .get(
                this.mapQuery.map.bind(this.mapQuery),
                this.patientsController.get.bind(this.patientsController)
            )
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
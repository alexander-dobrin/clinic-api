import { Router } from 'express';
import DoctorsController from '../controllers/doctors-controller';
import DtoValidatorMiddleware from '../middlewares/dto-validator-middleware';
import CreateDoctorDto from '../dto/doctors/create-doctor-dto';
import UpdateDoctorDto from '../dto/doctors/update-doctor-dto';
import { IRoutes } from './routes-interface';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { IHttpController } from '../controllers/http-controller-interface';
import { TYPES } from '../types';

@injectable()
export default class DoctorsRoutes implements IRoutes {
    private readonly _router: Router;
    private readonly createValidator = new DtoValidatorMiddleware(CreateDoctorDto);
    private readonly updateValidator = new DtoValidatorMiddleware(UpdateDoctorDto);
    
    constructor(
        @inject(TYPES.DOCTORS_CONTROLLER) private readonly doctorsController: IHttpController
    ) {
        this.doctorsController = doctorsController;
        this._router = Router();

        this.setupRoutes();
    }

    private setupRoutes(): void {
        this._router.route('/')
            .get(this.doctorsController.get.bind(this.doctorsController))
            .post(
                this.createValidator.validate.bind(this.createValidator),
                this.doctorsController.post.bind(this.doctorsController)
            );

        this._router.route('/:id')
            .get(this.doctorsController.getById.bind(this.doctorsController))
            .put(
                this.updateValidator.validate.bind(this.updateValidator),
                this.doctorsController.put.bind(this.doctorsController)
            )
            .delete(this.doctorsController.delete.bind(this.doctorsController));
    }

    get router(): Router {
        return this._router;
    }
}
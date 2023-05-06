import { Router } from 'express';
import DoctorsController from '../controllers/doctors-controller';
import DtoValidatorMiddleware from '../middlewares/dto-validator-middleware';
import CreateDoctorDto from '../dto/doctors/create-doctor-dto';
import UpdateDoctorDto from '../dto/doctors/update-doctor-dto';

export default class DoctorsRoutes {
    private readonly doctorsController: DoctorsController;
    private readonly _router: Router;
    private readonly createValidator = new DtoValidatorMiddleware(CreateDoctorDto);
    private readonly updateValidator = new DtoValidatorMiddleware(UpdateDoctorDto);
    
    constructor(doctorsController: DoctorsController) {
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
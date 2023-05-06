import { Router } from 'express';
import AppointmentsController from '../controllers/appointments-controller';
import DtoValidatorMiddleware from '../middlewares/dto-validator-middleware';
import { CreateAppointmentDto } from '../dto/appointments/create-appointment-dto';
import { UpdateAppointmentDto } from '../dto/appointments/update-appointment-dto';

export default class AppointmentsRoutes {
    private readonly appointmentsController: AppointmentsController;
    private readonly _router: Router;
    private readonly createValidator = new DtoValidatorMiddleware(CreateAppointmentDto);
    private readonly updateValidator = new DtoValidatorMiddleware(UpdateAppointmentDto);

    constructor(appointmentsController: AppointmentsController) {
        this.appointmentsController = appointmentsController;
        this._router = Router();   
        this.setupRoutes();
    }

    private setupRoutes() {
        this._router.route('/')
            .get(this.appointmentsController.get.bind(this.appointmentsController))
            .post(
                this.createValidator.validate.bind(this.createValidator),
                this.appointmentsController.post.bind(this.appointmentsController)
        );

        this._router.route('/:id')
            .get(this.appointmentsController.getById.bind(this.appointmentsController))
            .put(
                this.updateValidator.validate.bind(this.updateValidator),
                this.appointmentsController.put.bind(this.appointmentsController)
            )
            .delete(this.appointmentsController.delete.bind(this.appointmentsController)
        );
    }

    get router(): Router {
        return this._router;
    }
}

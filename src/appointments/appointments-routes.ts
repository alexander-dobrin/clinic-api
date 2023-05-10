import { Router } from 'express';
import DtoValidatorMiddleware from '../common/middlewares/dto-validator-middleware';
import { CreateAppointmentDto } from './dto/create-appointment-dto';
import { UpdateAppointmentDto } from './dto/update-appointment-dto';
import { IRoutes } from '../common/types';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { IHttpController } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';

@injectable()
export default class AppointmentsRoutes implements IRoutes {
    private readonly _router: Router;
    private readonly createValidator = new DtoValidatorMiddleware(CreateAppointmentDto);
    private readonly updateValidator = new DtoValidatorMiddleware(UpdateAppointmentDto);

    constructor(
        @inject(CONTAINER_TYPES.APPOINTMENTS_CONTROLLER) private readonly appointmentsController: IHttpController
    ) {
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

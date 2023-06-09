import { Router } from 'express';
import { IRoutes } from '../common/types';
import { injectable, inject } from 'inversify';
import { IHttpController } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import { QueryMapperMiddleware } from '../common/middleware/query-mapper-middleware';

@injectable()
export class AppointmentRoutes implements IRoutes {
	private readonly _router: Router;
	private readonly mapQueryParams = new QueryMapperMiddleware();

	constructor(
		@inject(CONTAINER_TYPES.APPOINTMENT_CONTROLLER)
		private readonly appointmentsController: IHttpController,
	) {
		this._router = Router();
		this.setupRoutes();
	}

	private setupRoutes() {
		this._router
			.route('/')
			.get(
				this.mapQueryParams.map.bind(this.mapQueryParams),
				this.appointmentsController.get.bind(this.appointmentsController),
			)
			.post(this.appointmentsController.post.bind(this.appointmentsController));

		this._router
			.route('/:id')
			.get(this.appointmentsController.getById.bind(this.appointmentsController))
			.put(this.appointmentsController.put.bind(this.appointmentsController))
			.delete(this.appointmentsController.delete.bind(this.appointmentsController));
	}

	get router(): Router {
		return this._router;
	}
}

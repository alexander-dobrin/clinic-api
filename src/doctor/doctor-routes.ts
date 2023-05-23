import { Router } from 'express';
import { IRoutes } from '../common/types';
import { injectable, inject } from 'inversify';
import { IHttpController } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import { QueryMapperMiddleware } from '../common/middlewares/query-mapper-middleware';

@injectable()
export class DoctorRoutes implements IRoutes {
	private readonly _router: Router;
	private readonly queryMapper = new QueryMapperMiddleware();

	constructor(
		@inject(CONTAINER_TYPES.DOCTORS_CONTROLLER) private readonly doctorsController: IHttpController,
	) {
		this.doctorsController = doctorsController;
		this._router = Router();

		this.setupRoutes();
	}

	private setupRoutes(): void {
		this._router
			.route('/')
			.get(
				this.queryMapper.map.bind(this.queryMapper),
				this.doctorsController.get.bind(this.doctorsController),
			)
			.post(this.doctorsController.post.bind(this.doctorsController));

		this._router
			.route('/:id')
			.get(this.doctorsController.getById.bind(this.doctorsController))
			.put(this.doctorsController.put.bind(this.doctorsController))
			.delete(this.doctorsController.delete.bind(this.doctorsController));
	}

	get router(): Router {
		return this._router;
	}
}

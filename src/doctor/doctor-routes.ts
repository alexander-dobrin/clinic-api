import { Router } from 'express';
import { IRoutes } from '../common/types';
import { injectable, inject } from 'inversify';
import { IHttpController } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import { QueryMapperMiddleware } from '../common/middleware/query-mapper-middleware';
import { AuthMiddleware } from '../auth/auth-middleware';
import { iocContainer } from '../inversify.config';

@injectable()
export class DoctorRoutes implements IRoutes {
	private readonly _router: Router;
	private readonly queryMapper = new QueryMapperMiddleware();
	private readonly authMiddleware = iocContainer.get<AuthMiddleware>(
		CONTAINER_TYPES.AUTH_MIDDLEWARE,
	);

	constructor(
		@inject(CONTAINER_TYPES.DOCTOR_CONTROLLER) private readonly doctorsController: IHttpController,
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
			.post(
				this.authMiddleware.auth.bind(this.authMiddleware),
				this.doctorsController.post.bind(this.doctorsController),
			);

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

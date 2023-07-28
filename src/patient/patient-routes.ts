import { Router } from 'express';
import { IRoutes } from '../common/types';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { IHttpController } from '../common/types';
import { ParseQueryOptionsMiddleware } from '../common/middleware/parse-query-options-middleware';
import { AuthMiddleware } from '../auth/middleware/auth-middleware';
import { iocContainer } from '../common/config/inversify.config';

@injectable()
export class PatientRoutes implements IRoutes {
	private readonly _router = Router();
	private readonly mapQuery = new ParseQueryOptionsMiddleware();
	private readonly authMiddleware = iocContainer.get<AuthMiddleware>(
		CONTAINER_TYPES.AUTH_MIDDLEWARE,
	);

	constructor(
		@inject(CONTAINER_TYPES.PATIENT_CONTROLLER)
		private readonly patientsController: IHttpController,
	) {
		this.setupRoutes();
	}

	private setupRoutes(): void {
		this.router
			.route('/')
			.get(
				this.mapQuery.map.bind(this.mapQuery),
				this.patientsController.get.bind(this.patientsController),
			)
			.post(
				this.authMiddleware.auth.bind(this.authMiddleware),
				this.patientsController.post.bind(this.patientsController),
			);

		this._router
			.route('/:id')
			.get(this.patientsController.getById.bind(this.patientsController))
			.put(this.patientsController.put.bind(this.patientsController))
			.delete(this.patientsController.delete.bind(this.patientsController));
	}

	get router(): Router {
		return this._router;
	}
}

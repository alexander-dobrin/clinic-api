import { Router } from 'express';
import { IRoutes } from '../common/types';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { IHttpController } from '../common/types';
import { ParseQueryOptionsMiddleware } from '../common/middleware/parse-query-options-middleware';
import { AuthMiddleware } from '../auth/middleware/auth-middleware';
import { iocContainer } from '../common/config/inversify.config';
import { RoleMiddleware } from '../auth/middleware/role-middleware';
import { UserRoleEnum } from '../common/enums';

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
		@inject(CONTAINER_TYPES.ROLE_MIDDLEWARE) private readonly roleMiddleware: RoleMiddleware,
	) {
		this.setupRoutes();
	}

	private setupRoutes(): void {
		this.router
			.route('/')
			.get(
				this.authMiddleware.auth.bind(this.authMiddleware),
				this.roleMiddleware
					.checkRole(UserRoleEnum.ADMIN, UserRoleEnum.DOCTOR, UserRoleEnum.PATIENT)
					.bind(this.roleMiddleware),
				this.mapQuery.map.bind(this.mapQuery),
				this.patientsController.get.bind(this.patientsController),
			)
			.post(
				this.authMiddleware.auth.bind(this.authMiddleware),
				this.roleMiddleware.checkRole(UserRoleEnum.ADMIN).bind(this.roleMiddleware),
				this.patientsController.post.bind(this.patientsController),
			);

		this._router
			.route('/:id')
			.get(
				this.authMiddleware.auth.bind(this.authMiddleware),
				this.roleMiddleware
					.checkRole(UserRoleEnum.ADMIN, UserRoleEnum.DOCTOR, UserRoleEnum.PATIENT)
					.bind(this.roleMiddleware),
				this.patientsController.getById.bind(this.patientsController),
			)
			.put(
				this.authMiddleware.auth.bind(this.authMiddleware),
				this.roleMiddleware
					.checkRole(UserRoleEnum.ADMIN, UserRoleEnum.PATIENT)
					.bind(this.roleMiddleware),
				this.patientsController.put.bind(this.patientsController),
			)
			.delete(
				this.authMiddleware.auth.bind(this.authMiddleware),
				this.roleMiddleware
					.checkRole(UserRoleEnum.ADMIN, UserRoleEnum.PATIENT)
					.bind(this.roleMiddleware),
				this.patientsController.delete.bind(this.patientsController),
			);
	}

	get router(): Router {
		return this._router;
	}
}

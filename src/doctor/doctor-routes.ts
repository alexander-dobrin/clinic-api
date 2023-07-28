import { Router } from 'express';
import { IRoutes } from '../common/types';
import { injectable, inject } from 'inversify';
import { IHttpController } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import { ParseQueryOptionsMiddleware } from '../common/middleware/parse-query-options-middleware';
import { AuthMiddleware } from '../auth/middleware/auth-middleware';
import { RoleMiddleware } from '../auth/middleware/role-middleware';
import { UserRoleEnum } from '../common/enums';

@injectable()
export class DoctorRoutes implements IRoutes {
	private readonly _router: Router;
	private readonly queryMapper = new ParseQueryOptionsMiddleware();

	constructor(
		@inject(CONTAINER_TYPES.DOCTOR_CONTROLLER) private readonly doctorsController: IHttpController,
		@inject(CONTAINER_TYPES.AUTH_MIDDLEWARE) private readonly authMiddleware: AuthMiddleware,
		@inject(CONTAINER_TYPES.ROLE_MIDDLEWARE) private readonly roleMiddleware: RoleMiddleware,
	) {
		this.doctorsController = doctorsController;
		this._router = Router();

		this.setupRoutes();
	}

	private async setupRoutes() {
		this._router
			.route('/')
			.get(
				this.authMiddleware.auth.bind(this.authMiddleware),
				this.roleMiddleware
					.checkRole(UserRoleEnum.ADMIN, UserRoleEnum.PATIENT)
					.bind(this.roleMiddleware),
				this.queryMapper.map.bind(this.queryMapper),
				this.doctorsController.get.bind(this.doctorsController),
			)
			.post(
				this.authMiddleware.auth.bind(this.authMiddleware),
				this.roleMiddleware.checkRole(UserRoleEnum.ADMIN).bind(this.roleMiddleware),
				this.doctorsController.post.bind(this.doctorsController),
			);

		this._router.get(
			'/:id',
			this.authMiddleware.auth.bind(this.authMiddleware),
			this.roleMiddleware
				.checkRole(UserRoleEnum.ADMIN, UserRoleEnum.DOCTOR, UserRoleEnum.PATIENT)
				.bind(this.roleMiddleware),
			this.doctorsController.getById.bind(this.doctorsController),
		);

		this._router
			.route('/:id')
			.put(
				this.authMiddleware.auth.bind(this.authMiddleware),
				this.roleMiddleware
					.checkRole(UserRoleEnum.ADMIN, UserRoleEnum.DOCTOR)
					.bind(this.roleMiddleware),
				this.doctorsController.put.bind(this.doctorsController),
			)
			.delete(
				this.authMiddleware.auth.bind(this.authMiddleware),
				this.roleMiddleware
					.checkRole(UserRoleEnum.ADMIN, UserRoleEnum.DOCTOR)
					.bind(this.roleMiddleware),
				this.doctorsController.delete.bind(this.doctorsController),
			);
	}

	get router(): Router {
		return this._router;
	}
}

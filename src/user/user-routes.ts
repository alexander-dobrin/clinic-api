import { Router } from 'express';
import { IRoutes } from '../common/types';
import { inject, injectable } from 'inversify';
import { UserController } from './user-controller';
import { CONTAINER_TYPES } from '../common/constants';
import { AuthMiddleware } from '../auth/middleware/auth-middleware';
import { ParseQueryOptionsMiddleware } from '../common/middleware/parse-query-options-middleware';

@injectable()
export class UserRoutes implements IRoutes {
	private readonly _router = Router();
	private readonly queryMapperMiddleware = new ParseQueryOptionsMiddleware();

	constructor(
		@inject(CONTAINER_TYPES.USER_CONTROLLER) private readonly userController: UserController,
		@inject(CONTAINER_TYPES.AUTH_MIDDLEWARE) private readonly authMiddleware: AuthMiddleware,
	) {
		this.setupRoutes();
	}

	private setupRoutes() {
		this._router
			.route('/')
			.get(
				this.queryMapperMiddleware.map.bind(this.queryMapperMiddleware),
				this.userController.get.bind(this.userController),
			)
			.post(this.userController.post.bind(this.userController));
		this._router
			.route('/profile')
			.get(
				this.authMiddleware.auth.bind(this.authMiddleware),
				this.userController.profile.bind(this.userController),
			);
		this._router
			.route('/:id')
			.get(this.userController.getById.bind(this.userController))
			.put(this.userController.put.bind(this.userController))
			.delete(this.userController.delete.bind(this.userController));
	}

	get router(): Router {
		return this._router;
	}
}

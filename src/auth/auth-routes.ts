import { Router } from 'express';
import { IRoutes } from '../common/types';
import { inject, injectable } from 'inversify';
import { AuthController } from './auth-controller';
import { CONTAINER_TYPES } from '../common/constants';

@injectable()
export class AuthRoutes implements IRoutes {
	private readonly _router = Router();

	constructor(
		@inject(CONTAINER_TYPES.AUTH_CONTROLLER) private readonly controller: AuthController,
	) {
		this.setupRoutes();
	}

	private setupRoutes() {
		this._router.post('/register', this.controller.register.bind(this.controller));
		this._router.post('/login', this.controller.login.bind(this.controller));
		this._router.get('/refresh', this.controller.refresh.bind(this.controller));
		this._router.post('/reset', this.controller.resetPassword.bind(this.controller));
		this._router.post('/recover', this.controller.recoverPassword.bind(this.controller));
	}

	get router(): Router {
		return this._router;
	}
}

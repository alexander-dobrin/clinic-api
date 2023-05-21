import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { AuthService } from './auth-service';
import { CONTAINER_TYPES } from '../common/constants';
import { StatusCodeEnum } from '../common/enums';

@injectable()
export default class AuthController {
	constructor(@inject(CONTAINER_TYPES.AUTH_SERVICE) private readonly authService: AuthService) {}

	public async register(req: Request, res: Response, next: NextFunction) {
		try {
			const registeredUser = await this.authService.register(req.body);
			res.status(StatusCodeEnum.CREATED).json(registeredUser);
		} catch (error) {
			next(error);
		}
	}

	public async login(req: Request, res: Response, next: NextFunction) {
		try {
			const loginedUser = await this.authService.login(req.body);
			if (!loginedUser) {
				res.sendStatus(StatusCodeEnum.NOT_FOUND);
				return;
			}
			res.json(loginedUser);
		} catch (error) {
			next(error);
		}
	}

	public async resetPassword(req: Request, res: Response, next: NextFunction) {
		try {
			const resetToken = await this.authService.resetPassword(req.body);
			res.json({ token: resetToken });
		} catch (error) {
			next(error);
		}
	}

	public async recoverPassword(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await this.authService.recoverPassword(req.body);
			res.json({ message: result });
		} catch (error) {
			next(error);
		}
	}
}

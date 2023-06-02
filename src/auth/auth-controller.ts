import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { AuthService } from './auth-service';
import { CONTAINER_TYPES } from '../common/constants';
import { StatusCodeEnum } from '../common/enums';
import { RegisterDto } from './dto/register-dto';
import { LoginDto } from './dto/login-dto';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { RecoverPasswordDto } from './dto/recover-password-dto';

@injectable()
export class AuthController {
	constructor(@inject(CONTAINER_TYPES.AUTH_SERVICE) private readonly authService: AuthService) {}

	public async register(
		req: Request<object, object, RegisterDto>,
		res: Response,
		next: NextFunction,
	) {
		try {
			const registeredUser = await this.authService.register(req.body);
			res.status(StatusCodeEnum.CREATED).json(registeredUser);
		} catch (error) {
			next(error);
		}
	}

	public async login(req: Request<object, object, LoginDto>, res: Response, next: NextFunction) {
		try {
			const loginedUser = await this.authService.login(req.body);
			res.json(loginedUser);
		} catch (error) {
			next(error);
		}
	}

	public async resetPassword(
		req: Request<object, object, ResetPasswordDto>,
		res: Response,
		next: NextFunction,
	) {
		try {
			const resetToken = await this.authService.resetPassword(req.body);
			res.json(resetToken);
		} catch (error) {
			next(error);
		}
	}

	public async recoverPassword(
		req: Request<object, object, RecoverPasswordDto>,
		res: Response,
		next: NextFunction,
	) {
		try {
			await this.authService.recoverPassword(req.body);
			res.json({ message: 'Password has been successfully recovered' });
		} catch (error) {
			next(error);
		}
	}
}

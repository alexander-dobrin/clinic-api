import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../../common/errors';
import { ErrorMessageEnum, StatusCodeEnum } from '../../common/enums';
import { AuthorizedRequest } from '../auth-types';
import { inject, injectable } from 'inversify';
import { TokenService } from '../../token/token-service';
import { CONTAINER_TYPES } from '../../common/constants';

@injectable()
export class AuthMiddleware {
	constructor(@inject(CONTAINER_TYPES.TOKEN_SERVICE) private readonly tokenService: TokenService) {}

	public auth(req: Request, res: Response, next: NextFunction) {
		try {
			const token = req.header('Authorization')?.replace('Bearer ', '');
			if (!token) {
				throw new HttpError(StatusCodeEnum.NOT_AUTHORIZED, ErrorMessageEnum.NOT_AUTHORIZED);
			}
			const decoded = this.tokenService.decodeAccessTokenOrFail(token);
			(req as AuthorizedRequest<unknown>).user = decoded;
			next();
		} catch (err) {
			next(err);
		}
	}
}

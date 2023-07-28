import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../../common/errors';
import { ErrorMessageEnum, StatusCodeEnum, UserRoleEnum } from '../../common/enums';
import { TokenService } from '../../token/token-service';
import { CONTAINER_TYPES } from '../../common/constants';
import { inject, injectable } from 'inversify';

@injectable()
export class RoleMiddleware {
	constructor(@inject(CONTAINER_TYPES.TOKEN_SERVICE) private readonly tokenService: TokenService) {}

	public checkRole(...roles: UserRoleEnum[]) {
		return (req: Request, res: Response, next: NextFunction) => {
			try {
				const token = req.header('Authorization')?.replace('Bearer ', '');

				if (!token) {
					throw new HttpError(StatusCodeEnum.NOT_AUTHORIZED, ErrorMessageEnum.NOT_AUTHORIZED);
				}

				const decoded = this.tokenService.decodeAccessTokenOrFail(token);
				const isForbidden = !roles.includes(decoded.role);

				if (isForbidden) {
					next(new HttpError(StatusCodeEnum.FORBIDDEN, `Forbidden`));
				}

				next();
			} catch (err) {
				next(err);
			}
		};
	}
}

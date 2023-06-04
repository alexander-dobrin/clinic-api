import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../common/errors';
import { ErrorMessageEnum, StatusCodeEnum } from '../common/enums';
import { AuthorizedRequest, UserPayload } from './auth-types';
import { injectable } from 'inversify';

@injectable()
export class AuthMiddleware {
	public async auth(req: Request, res: Response, next: NextFunction) {
		try {
			const token = req.header('Authorization')?.replace('Bearer ', '');
			if (!token) {
				throw new HttpError(StatusCodeEnum.NOT_AUTHORIZED, ErrorMessageEnum.NOT_AUTHORIZED);
			}
			const decoded = jwt.verify(token, process.env.SECRET_KEY) as UserPayload;
			(req as AuthorizedRequest<unknown>).user = decoded;
			next();
		} catch (err) {
			next(err);
		}
	}
}

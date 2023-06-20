import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors';
import { StatusCodeEnum } from '../enums';
import { injectable } from 'inversify';
import { JsonWebTokenError } from 'jsonwebtoken';

@injectable()
export class ErrorFilterMiddleware {
	public catch(err: Error, req: Request, res: Response, next: NextFunction) {
		if (err instanceof HttpError) {
			return res.status(err.code).json({ error: { message: err.message } });
		}
		if (err instanceof JsonWebTokenError) {
			return res.status(StatusCodeEnum.NOT_AUTHORIZED).json({ error: { message: err.message } });
		}
		if (err instanceof SyntaxError) {
			return res.status(StatusCodeEnum.BAD_REQUEST).json({ error: { message: 'Invalid json' } });
		}
		res.sendStatus(StatusCodeEnum.INTERNAL_SERVER_ERROR);
		next(err);
	}
}

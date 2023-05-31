import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors';
import { StatusCodeEnum } from '../enums';
import { injectable } from 'inversify';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@injectable()
export class ExceptionFilter {
	public catch(err: Error, req: Request, res: Response, next: NextFunction) {
		if (err instanceof HttpError) {
			return res.status(err.code).json({ error: { message: err.message } });
		}
		if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
			return res.status(StatusCodeEnum.NOT_AUTHORIZED).json({ error: { message: err.message } });
		}
		console.log(err);
		res.sendStatus(StatusCodeEnum.INTERNAL_SERVER_ERROR);
		next(err);
	}
}

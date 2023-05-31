import { StatusCodeEnum } from './enums';

export class HttpError extends Error {
	constructor(public code: StatusCodeEnum, message: string) {
		super(message);
		Error.captureStackTrace(this, HttpError);
	}
}

import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { StatusCodeEnum } from '../enums';
import { RequestMethodEnum } from '../enums';

export class DtoValidatorMiddleware<TDto extends object> {
	private readonly dtoClassConstructor: ClassConstructor<TDto>;

	constructor(dtoClassConstructor: ClassConstructor<TDto>) {
		this.dtoClassConstructor = dtoClassConstructor;
	}

	async validate(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		if (req.method === RequestMethodEnum.GET) {
			return next();
		}
		const dtoObject = plainToClass(this.dtoClassConstructor, req.body);
		const validationErrors = (await validate(dtoObject)).map((err: ValidationError) =>
			Object.values(err.constraints).join('; '),
		);
		if (validationErrors.length > 0) {
			return res.status(StatusCodeEnum.UNPROCESSABLE_ENTITY).json({ errors: validationErrors });
		}
		next();
	}
}

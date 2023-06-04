import { ClassConstructor } from 'class-transformer';
import { NextFunction, Request, Response, Router } from 'express';

export interface GetOptions {
	sort?: object;
	filter?: object;
}

export interface IHttpController {
	get(req: Request, res: Response, next: NextFunction): Promise<void>;
	getById(req: Request, res: Response, next: NextFunction): Promise<void>;
	post(req: Request, res: Response, next: NextFunction): Promise<void>;
	put(req: Request, res: Response, next: NextFunction): Promise<void>;
	delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface IRoutes {
	get router(): Router;
}

export interface ValidDtoParamInfo<T extends object> {
	index: number;
	validationClassConstructor: ClassConstructor<T>;
}
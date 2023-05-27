import { inject, injectable } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { NextFunction, Request, Response } from 'express';
import { UserService } from './user-service';
import { StatusCodeEnum } from '../common/enums';
import { AuthorizedRequest } from '../auth/auth-middleware';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { IQueryParams } from '../common/types';

@injectable()
export class UserController {
	constructor(@inject(CONTAINER_TYPES.USER_SERVICE) private readonly userService: UserService) {}

	public async post(
		req: Request<object, object, CreateUserDto>,
		res: Response,
		next: NextFunction,
	) {
		try {
			const user = await this.userService.create(req.body);
			res.status(StatusCodeEnum.CREATED).json(user);
		} catch (err) {
			next(err);
		}
	}

	public async get(
		req: Request<object, object, object, IQueryParams>,
		res: Response,
		next: NextFunction,
	) {
		try {
			const users = await this.userService.get(req.query);
			if (users.length < 1) {
				res.sendStatus(StatusCodeEnum.NO_CONTENT);
				return;
			}
			res.json(users);
		} catch (err) {
			next(err);
		}
	}

	public async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
		try {
			const user = await this.userService.getById(req.params.id);
			res.json(user);
		} catch (err) {
			next(err);
		}
	}

	public async profile(req: AuthorizedRequest, res: Response, next: NextFunction) {
		try {
			const profile = await this.userService.getById(req.user.id);
			res.json(profile);
		} catch (err) {
			next(err);
		}
	}

	public async put(
		req: Request<{ id: string }, object, UpdateUserDto>,
		res: Response,
		next: NextFunction,
	) {
		try {
			const user = await this.userService.update(req.params.id, req.body);
			res.json(user);
		} catch (err) {
			next(err);
		}
	}

	public async delete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
		try {
			const user = await this.userService.delete(req.params.id);
			res.json(user);
		} catch (err) {
			next(err);
		}
	}
}

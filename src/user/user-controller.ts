import { inject, injectable } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { NextFunction, Request, Response } from 'express';
import { UserService } from './user-service';
import { StatusCodeEnum } from '../common/enums';
import { AuthorizedRequest } from '../common/middlewares/auth-middleware';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';

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

	public async get(req: Request, res: Response, next: NextFunction) {
		const users = await this.userService.get();
		if (users.length < 1) {
			res.sendStatus(StatusCodeEnum.NO_CONTENT);
			return;
		}
		res.json(users);
	}

	public async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
		const user = await this.userService.getById(req.params.id);
		if (!user) {
			return res.sendStatus(StatusCodeEnum.NOT_FOUND);
		}
		res.json(user);
	}

	public async profile(req: AuthorizedRequest, res: Response, next: NextFunction) {
		const profile = await this.userService.getById(req.user.id);
		if (!profile) {
			return res.sendStatus(StatusCodeEnum.NOT_FOUND);
		}
		res.json(profile);
	}

	public async put(
		req: Request<{ id: string }, object, UpdateUserDto>,
		res: Response,
		next: NextFunction,
	) {
		try {
			const user = await this.userService.update(req.params.id, req.body);
			if (!user) {
				res.sendStatus(StatusCodeEnum.NOT_FOUND);
				return;
			}
			res.json(user);
		} catch (err) {
			next(err);
		}
	}

	public async delete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
		try {
			const user = await this.userService.delete(req.params.id);
			if (!user) {
				res.sendStatus(StatusCodeEnum.NOT_FOUND);
				return;
			}
			res.json(user);
		} catch (err) {
			next(err);
		}
	}
}

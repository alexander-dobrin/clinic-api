import { inject, injectable } from "inversify";
import 'reflect-metadata';
import { CONTAINER_TYPES } from "../common/constants";
import { NextFunction, Request, Response } from "express";
import UserService from "./user-service";
import { StatusCodeEnum } from "../common/enums";
import { CreateUserDto } from "./dto/create-user-dto";

@injectable()
export class UserController {
    constructor(
        @inject(CONTAINER_TYPES.USER_SERVICE) private readonly userService: UserService
    ) {
        
    }

    public async post(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.createUser(req.body);
            res.status(StatusCodeEnum.CREATED).json(user);
        } catch (err) {
            next(err);
        }
    }

    public async get(req: Request, res: Response, next: NextFunction) {
        const users = await this.userService.getAllUsers();
        if (users.length < 1) {
            res.sendStatus(StatusCodeEnum.NO_CONTENT);
            return;
        }
        res.json(users);
    }

    public async getById(req: Request, res: Response, next: NextFunction) {
        const user = await this.userService.getUserById(req.params.id);
        if (!user) {
            return res.sendStatus(StatusCodeEnum.NOT_FOUND);
        }
        res.json(user);
    }

    public async put(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.updateUserById(req.params.id, req.body);
            if (!user) {
                res.sendStatus(StatusCodeEnum.NOT_FOUND);
                return;
            }
            res.json(user);
        } catch (err) {
            next(err);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.deleteUserById(req.params.id);
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
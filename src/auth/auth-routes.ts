import { Router } from "express";
import { IRoutes } from "../common/types";
import { inject, injectable } from "inversify";
import 'reflect-metadata';
import AuthController from "./auth-controller";
import { CONTAINER_TYPES } from "../common/constants";
import DtoValidatorMiddleware from "../common/middlewares/dto-validator-middleware";
import { CreateUserDto } from "../users/dto/create-user-dto";

@injectable()
export class AuthRoutes implements IRoutes {
    private readonly _router = Router();
    private readonly createValidator = new DtoValidatorMiddleware(CreateUserDto);

    constructor(
        @inject(CONTAINER_TYPES.AUTH_CONTROLLER) private readonly controller: AuthController
    ) {
        this.setupRoutes();
    }

    private setupRoutes() {
        this._router.post(
            '/register', 
            this.createValidator.validate.bind(this.createValidator),
            this.controller.register.bind(this.controller));
        this._router.post('/login', this.controller.login.bind(this.controller));
    }

    get router(): Router {
        return this._router;
    }
}
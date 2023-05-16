import { Router } from "express";
import { IRoutes } from "../common/types";
import { inject, injectable } from "inversify";
import AuthController from "./auth-controller";
import { CONTAINER_TYPES } from "../common/constants";
import DtoValidatorMiddleware from "../common/middlewares/dto-validator-middleware";
import { LoginDto } from "./dto/login-dto";
import { ResetPasswordDto } from "./dto/reset-password-dto";
import { RecoverPasswordDto } from "./dto/recover-password-dto";
import { RegisterDto } from "./dto/register-dto";

@injectable()
export class AuthRoutes implements IRoutes {
    private readonly _router = Router();
    private readonly registerValidator = new DtoValidatorMiddleware(RegisterDto);
    private readonly loginValidator = new DtoValidatorMiddleware(LoginDto);
    private readonly resetValidator = new DtoValidatorMiddleware(ResetPasswordDto);
    private readonly recoverValidator = new DtoValidatorMiddleware(RecoverPasswordDto);

    constructor(
        @inject(CONTAINER_TYPES.AUTH_CONTROLLER) private readonly controller: AuthController
    ) {
        this.setupRoutes();
    }

    private setupRoutes() {
        // Review: are the routes ok?
        this._router.post(
            '/register', 
            this.registerValidator.validate.bind(this.registerValidator),
            this.controller.register.bind(this.controller));
        this._router.post(
            '/login', 
            this.loginValidator.validate.bind(this.loginValidator),
            this.controller.login.bind(this.controller)
        );
        this._router.post(
            '/reset',
            this.resetValidator.validate.bind(this.resetValidator),
            this.controller.resetPassword.bind(this.controller)
        );
        this._router.post(
            '/recover',
            this.recoverValidator.validate.bind(this.recoverValidator),
            this.controller.recoverPassword.bind(this.controller)
        );
    }

    get router(): Router {
        return this._router;
    }
}
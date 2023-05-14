import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import 'reflect-metadata';
import { AuthService } from "./auth-service";
import { CONTAINER_TYPES } from "../common/constants";

@injectable()
export default class AuthController {
    constructor(
        @inject(CONTAINER_TYPES.AUTH_SERVICE) private readonly authService: AuthService
    ) {

    }

    public async register(req: Request, res: Response, next: NextFunction) {
        try {
            const registeredUser = await this.authService.register(req.body);
            res.json(registeredUser);
        } catch (error) {
            next(error);
        }
    }

    public login(req: Request, res: Response, next: NextFunction) {
        console.log('/login');
    }

    // private async signIn(user) {
    //     const foundUser = users.find(u => u.name === user.name);

    // if (!foundUser) {
    //     throw new Error('Name of user is not correct');
    // }

    // const isMatch = await bcrypt.compare(user.password, foundUser.password);

    // if (isMatch) {
    //     const token = jwt.sign({ id: foundUser.id?.toString(), name: foundUser.name }, SECRET_KEY, {
    //         expiresIn: '2 days',
    //     });

    //     return { user: { id: foundUser.id, name: foundUser.name }, token };
    // } else {
    //     throw new Error('Password is not correct');
    // }
    // }
}
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../errors';
import { ErrorMessageEnum, StatusCodeEnum } from '../enums';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../constants';
import UserService from '../../users/user-service';
import { UserPayload } from '../../auth/auth-types';

export interface AuthorizedRequest extends Request {
    user: JwtPayload;
}

@injectable()
export class AuthMiddleware {
    constructor(@inject(CONTAINER_TYPES.USER_SERVICE) private readonly userService: UserService) {

    }

    public async auth(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                throw new NotAuthorizedError(ErrorMessageEnum.NOT_AUTHORIZED);
            }
    
            const decoded = jwt.verify(token, process.env.SECRET_KEY) as UserPayload;

            // Review: shold middleware use userService to check user was not deleted?
            const user = await this.userService.getUserById(decoded.id);
            if (!user) {
                throw new NotAuthorizedError(ErrorMessageEnum.NOT_AUTHORIZED);
            }
    
            (req as AuthorizedRequest).user = decoded;
    
            next();
        } catch (err) {
            res.status(StatusCodeEnum.NOT_AUTHORIZED).json({ message: ErrorMessageEnum.NOT_AUTHORIZED });
        }
    }
}
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../errors';
import { ErrorMessageEnum, StatusCodeEnum } from '../enums';

export interface AuthorizedRequest extends Request {
    user: JwtPayload;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new NotAuthorizedError(ErrorMessageEnum.NOT_AUTHORIZED);
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY) as JwtPayload;

        (req as AuthorizedRequest).user = decoded;

        next();
    } catch (err) {
        res.status(StatusCodeEnum.NOT_AUTHORIZED).json({ message: ErrorMessageEnum.NOT_AUTHORIZED });
    }
};

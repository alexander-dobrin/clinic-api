import { Request, Response, NextFunction } from "express";
import { InvalidParameterError, NotAuthorizedError, UnableToSortError, UserConfilctError } from "../errors";
import { DuplicateEntityError } from "../errors";
import { StatusCodeEnum } from "../enums";
import { AppointmentConflictError } from "../errors";
import { injectable } from 'inversify';

@injectable()
export class ExceptionFilter {
    public catch(err: Error, req: Request, res: Response, next: NextFunction) {
        if (
            err instanceof InvalidParameterError ||
            err instanceof DuplicateEntityError
        ) {
            res.status(StatusCodeEnum.BAD_REQUEST).json({ error: { message: err.message } });
            return;
        } else if (
            err instanceof AppointmentConflictError ||
            err instanceof UserConfilctError
        ) {
            res.status(StatusCodeEnum.CONFLICT).json({ error: { message: err.message } });
            return;
        } else if (err instanceof UnableToSortError) {
            res.status(StatusCodeEnum.UNPROCESSABLE_ENTITY).json({ error: { message: err.message } });
            return;
        } else if (err instanceof NotAuthorizedError) {
            return res.status(StatusCodeEnum.NOT_AUTHORIZED).json({ error: { message: err.message } });
        }
        console.log(err);
        res.sendStatus(StatusCodeEnum.INTERNAL_SERVER_ERROR);
    }
}
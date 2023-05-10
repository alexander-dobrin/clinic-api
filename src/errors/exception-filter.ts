import { Request, Response, NextFunction } from "express";
import { InvalidParameterError } from "./invalid-parameter-error";
import { DuplicateEntityError } from "./duplicate-entity-error";
import { StatusCodes } from "../enums/status-codes";
import { AppointmentConflictError } from "./appointment-conflict-error";
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class ExceptionFilter {
    public catch(err: Error, req: Request, res: Response, next: NextFunction) {
        if (
            err instanceof InvalidParameterError ||
            err instanceof DuplicateEntityError
        ) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: { message: err.message } });
            return;
        } else if (err instanceof AppointmentConflictError) {
            res.status(StatusCodes.CONFLICT).json({ error: { message: err.message } });
            return;
        }
        console.log(err);
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}
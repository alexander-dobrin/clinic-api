import { STATUS_CODES } from '../enums';
import { AppointmentConflictError } from '../exceptions/appointment-conflict-error';
import { InvalidParameterError } from '../exceptions/invalid-parameter-error';
import { MissingParameterError } from '../exceptions/missing-parameter-error';
import AppointmentsService from '../services/appointments-service';
import { Request, Response, NextFunction } from 'express';

export default class AppointmentsController {
    private readonly appointmentService: AppointmentsService;

    constructor(appointmentService: AppointmentsService) {
        this.appointmentService = appointmentService;
    }

    async post(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const created = await this.appointmentService.createAppointment(req.body);
            if (!created) {
                res.sendStatus(STATUS_CODES.NOT_FOUND);
                return;
            }    
            res.status(STATUS_CODES.CREATED).json(created);
        } catch (err) {
            next(err);
        }
    }

    async get(req, res): Promise<void> {
        const appointments = await this.appointmentService.getAllAppointments();
        if(appointments.length < 1) {
            res.status(STATUS_CODES.NO_CONTENT);
        }
        res.json(appointments);
    }

    async getById(req, res): Promise<void> {
        const appointment = await this.appointmentService.getAppointmentById(req.params.id);
        if (!appointment) {
            res.sendStatus(STATUS_CODES.NOT_FOUND);
            return;
        }
        res.json(appointment);
    }

    async put(req, res): Promise<void> {
        try {
            req.body.id = req.params.id;
            const updated = await this.appointmentService.updateAppointmentById(req.params.id, req.body);
            if (!updated) {
                res.sendStatus(STATUS_CODES.NOT_FOUND);
                return;
            }    
            res.json(updated);
        } catch (err) {
            if (err instanceof InvalidParameterError) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ error: { message: err.message } });
                return;
            }
            if (err instanceof AppointmentConflictError) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ error: { message: err.message } });
                return;
            }
            if (err instanceof MissingParameterError) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ error: { message: err.message } });
                return;
            }
            console.log(err);
            res.sendStatus(STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    public async delete(req: Request, res: Response): Promise<void> {
        const removed = await this.appointmentService.deleteAppointmentById(req.params.id);
        if (!removed) {
            res.sendStatus(STATUS_CODES.NOT_FOUND);
            return;
        }
        res.json(removed);
    }
}
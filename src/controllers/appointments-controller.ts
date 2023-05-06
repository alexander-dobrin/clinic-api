import { StatusCodes } from '../enums/status-codes';
import AppointmentsService from '../services/appointments-service';
import { Request, Response, NextFunction } from 'express';

export default class AppointmentsController {
    private readonly appointmentService: AppointmentsService;

    constructor(appointmentService: AppointmentsService) {
        this.appointmentService = appointmentService;
    }

    public async post(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const created = await this.appointmentService.createAppointment(req.body);
            if (!created) {
                res.sendStatus(StatusCodes.NOT_FOUND);
                return;
            }    
            res.status(StatusCodes.CREATED).json(created);
        } catch (err) {
            next(err);
        }
    }

    public async get(req: Request, res: Response): Promise<void> {
        const appointments = await this.appointmentService.getAllAppointments();
        if(appointments.length < 1) {
            res.status(StatusCodes.NO_CONTENT);
        }
        res.json(appointments);
    }

    public async getById(req: Request, res: Response): Promise<void> {
        const appointment = await this.appointmentService.getAppointmentById(req.params.id);
        if (!appointment) {
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }
        res.json(appointment);
    }

    public async put(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            req.body.id = req.params.id;
            const updated = await this.appointmentService.updateAppointmentById(req.params.id, req.body);
            if (!updated) {
                res.sendStatus(StatusCodes.NOT_FOUND);
                return;
            }    
            res.json(updated);
        } catch (err) {
            next(err);
        }
    }

    public async delete(req: Request, res: Response): Promise<void> {
        const removed = await this.appointmentService.deleteAppointmentById(req.params.id);
        if (!removed) {
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }
        res.json(removed);
    }
}
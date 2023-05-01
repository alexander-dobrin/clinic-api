import { STATUS_CODES } from '../enums';
import { AppointmentConflictError } from '../exceptions/appointment-conflict-error';
import { InvalidParameterError } from '../exceptions/invalid-parameter-error';
import { MissingParameterError } from '../exceptions/missing-parameter-error';

export class AppointmentsController {
    appointmentService;

    constructor(appointmentService) {
        this.appointmentService = appointmentService;
    }

    async post(req, res) {
        try {
            const created = await this.appointmentService.create(req.body);
            if (!created) {
                res.sendStatus(STATUS_CODES.NOT_FOUND);
                return;
            }    
            res.status(STATUS_CODES.CREATED).json(created);
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

    async get(req, res) {
        const appointments = await this.appointmentService.getAll();
        if(appointments.length < 1) {
            res.status(STATUS_CODES.NO_CONTENT);
        }
        res.json(appointments);
    }

    async getById(req, res) {
        const appointment = await this.appointmentService.getById(req.params.id);
        if (!appointment) {
            res.sendStatus(STATUS_CODES.NOT_FOUND);
            return;
        }
        res.json(appointment);
    }

    async put(req, res) {
        try {
            req.body.id = req.params.id;
            const updated = await this.appointmentService.put(req.body);
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

    async delete(req, res) {
        const removed = await this.appointmentService.deleteById(req.params.id);
        if (!removed) {
            res.sendStatus(STATUS_CODES.NOT_FOUND);
            return;
        }
        res.json(removed);
    }
}
import { STATUS_CODES } from '../enums.mjs';
import { AppointmentConflictError } from '../exceptions/appointment-conflict-error.mjs';
import { InvalidParameterError } from '../exceptions/invalid-parameter-error.mjs';
import { MissingParameterError } from '../exceptions/missing-parameter-error.mjs';

export class AppointmentsController {
    constructor(appointmentService) {
        this.appointmentService = appointmentService;
    }

    post(req, res) {
        try {
            const created = this.appointmentService.create(req.body);
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

    get(req, res) {
        const appointments = this.appointmentService.getAll();
        if(appointments.length < 1) {
            res.status(STATUS_CODES.NO_CONTENT);
        }
        res.json(appointments);
    }

    getById(req, res) {
        const appointment = this.appointmentService.getById(req.params.id);
        if (!appointment) {
            res.sendStatus(STATUS_CODES.NOT_FOUND);
            return;
        }
        res.json(appointment);
    }

    put(req, res) {
        try {
            req.body.id = req.params.id;
            const updated = this.appointmentService.put(req.body);
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

    delete(req, res) {
        const removed = this.appointmentService.deleteById(req.params.id);
        if (!removed) {
            res.sendStatus(STATUS_CODES.NOT_FOUND);
            return;
        }
        res.json(removed);
    }
}
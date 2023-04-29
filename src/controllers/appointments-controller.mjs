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
        res.json(this.appointmentService.getAll());
    }
}
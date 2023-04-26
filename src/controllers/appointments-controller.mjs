import { STATUS_CODES } from '../enums.mjs';

export class AppointmentsController {
    constructor(appointmentService) {
        this.appointmentService = appointmentService;
    }

    post(req, res) {
        try {
            const appointment = this.appointmentService.schedule(
                req.body.patientId,
                req.body.doctorId,
                req.body.date);
            res.status(STATUS_CODES.CREATED).json(appointment);
        } catch (err) {
            res.sendStatus(err.statusCode);
        }
    }

    get(req, res) {
        res.json(this.appointmentService.getAll());
    }
}
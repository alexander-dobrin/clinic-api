import { STATUS_CODES } from "../enums";
import { InvalidParameterError } from "../exceptions/invalid-parameter-error";

export class DoctorsController {
    doctorsService;

    constructor(doctorsService) {
        this.doctorsService = doctorsService;
    }

    get(req, res) {
        const doctors = this.doctorsService.getAll(req.query.orderBy);
        if(doctors.length < 1) {
            res.status(STATUS_CODES.NO_CONTENT);
        }
        res.json(doctors);
    }

    getById(req, res) {
        const doctor = this.doctorsService.getById(req.params.id);
        if (!doctor) {
            res.sendStatus(STATUS_CODES.NOT_FOUND);
            return;
        }
        res.json(doctor);
    }

    post(req, res) {
        try {
            const added = this.doctorsService.create(req.body);
            res.status(STATUS_CODES.CREATED).json(added);
        } catch (err) {
            if (err instanceof InvalidParameterError) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ error: { message: err.message } });
                return;
            }
            console.log(err);
            res.sendStatus(STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    put(req, res) {
        try {
            req.body.id = req.params.id;
            const updated = this.doctorsService.update(req.body);
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
            console.log(err);
            res.sendStatus(STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    delete(req, res) {
        const removed = this.doctorsService.deleteById(req.params.id);
        if (!removed) {
            res.sendStatus(STATUS_CODES.NOT_FOUND);
            return;
        }
        res.json(removed);
    }
}
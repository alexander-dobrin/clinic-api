import { STATUS_CODES } from "../enums";
import { InvalidParameterError } from "../exceptions/invalid-parameter-error";

export class DoctorsController {
    doctorsService;

    constructor(doctorsService) {
        this.doctorsService = doctorsService;
    }

    async get(req, res) {
        const doctors = await this.doctorsService.getAll(req.query.orderBy);
        if(doctors.length < 1) {
            res.status(STATUS_CODES.NO_CONTENT);
        }
        res.json(doctors);
    }

    async getById(req, res) {
        const doctor = await this.doctorsService.getById(req.params.id);
        if (!doctor) {
            res.sendStatus(STATUS_CODES.NOT_FOUND);
            return;
        }
        res.json(doctor);
    }

    async post(req, res) {
        try {
            const added = await this.doctorsService.create(req.body);
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

    async put(req, res) {
        try {
            req.body.id = req.params.id;
            const updated = await this.doctorsService.update(req.body);
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

    async delete(req, res) {
        const removed = await this.doctorsService.deleteById(req.params.id);
        if (!removed) {
            res.sendStatus(STATUS_CODES.NOT_FOUND);
            return;
        }
        res.json(removed);
    }
}
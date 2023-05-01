import { STATUS_CODES } from '../enums';
import { DuplicateEntityError } from '../exceptions/duplicate-entity-error';
import { InvalidParameterError } from '../exceptions/invalid-parameter-error';
import { MissingParameterError } from '../exceptions/missing-parameter-error';

export class PatientsController {
    patientsService;

    constructor(patientsService) {
        this.patientsService = patientsService;
    }

    async get(req, res) {
        const patients = await this.patientsService.getAll();
        if (patients.length < 1) {
            res.status(STATUS_CODES.NO_CONTENT);
        }
        res.json(patients);
    }

    async getByPhone(req, res) {
        const patient = await this.patientsService.getByPhone(req.params.phone);
        if (!patient) {
            res.sendStatus(STATUS_CODES.NOT_FOUND);
            return;
        }
        res.json(patient);
    }

    async post(req, res) {
        try {
            const created = await this.patientsService.create(req.body);
            res.status(STATUS_CODES.CREATED).json(created);
        } catch (err) {
            if (err instanceof MissingParameterError) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ error: { message: err.message } });
                return;
            }
            if (err instanceof InvalidParameterError) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ error: { message: err.message } });
                return;
            }
            if (err instanceof DuplicateEntityError) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ error: { message: err.message } });
                return;
            }
            console.log(err);
            res.sendStatus(STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    async put(req, res) {
        try {
            req.body.oldPhone = req.params.phone;
            const updated = await this.patientsService.update(req.body);
            if (!updated) {
                res.sendStatus(STATUS_CODES.NOT_FOUND);
                return;
            }
            res.json(updated);
        } catch (err) {
            if (err instanceof MissingParameterError) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ error: { message: err.message } });
                return;
            }
            if (err instanceof InvalidParameterError) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ error: { message: err.message } });
                return;
            }
            if (err instanceof DuplicateEntityError) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ error: { message: err.message } });
                return;
            }
            console.log(err);
            res.sendStatus(STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    delete(req, res) {
        try {
            const deleted = this.patientsService.deleteByPhone(req.params.phone);
            if (!deleted) {
                res.sendStatus(STATUS_CODES.NOT_FOUND);
                return;
            }
            res.json(deleted);
        } catch (err) {
            if (err instanceof MissingParameterError) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ error: { message: err.message } });
                return;
            }
            if (err instanceof InvalidParameterError) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ error: { message: err.message } });
                return;
            }
            console.log(err);
            res.sendStatus(STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
}
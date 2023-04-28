import { STATUS_CODES } from '../enums.mjs';
import { DuplicateEntityError } from '../exceptions/duplicate-entity-error.mjs';
import { InvalidParameterError } from '../exceptions/invalid-parameter-error.mjs';
import { MissingParameterError } from '../exceptions/missing-parameter-error.mjs';

export class PatientsController {
    constructor(patientsService) {
        this.patientsService = patientsService;
    }

    get(req, res) {
        const patients = this.patientsService.getAll();
        if (patients.length < 1) {
            res.status(STATUS_CODES.NO_CONTENT);
        }
        res.json(patients);
    }

    getByPhone(req, res) {
        const patient = this.patientsService.getByPhone(req.params.phone);
        if (!patient) {
            res.sendStatus(STATUS_CODES.NOT_FOUND);
            return;
        }
        res.json(patient);
    }

    post(req, res) {
        try {
            const created = this.patientsService.create(req.body);
            res.status(STATUS_CODES.CREATED).json(created);
        } catch (err) {
            if (err instanceof InvalidParameterError) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ error: { message: err.message } });
                return;
            }
            if (err instanceof DuplicateEntityError) {
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

    put(req, res) {
        try {
            const updated = this.patientsService.update(req.params.phone, req.body);
            res.json(updated);
        } catch (err) {
            res.status(STATUS_CODES.BAD_REQUEST).send(err.message);
        }
    }

    delete(req, res) {
        try {
            const deleted = this.patientsService.delete(req.params.phone);
            res.json(deleted);
        } catch (err) {
            res.status(STATUS_CODES.BAD_REQUEST).send(err.message);
        }
    }
}
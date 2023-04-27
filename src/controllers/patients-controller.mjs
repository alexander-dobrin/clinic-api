import { PatientEntity } from '../entities/patient-entity.mjs';
import { STATUS_CODES } from '../enums.mjs';

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
        }
        res.json((patient));
    }

    post(req, res) {
        const patient = new PatientEntity(req.body.firstName, req.body.phone);
        try {
            this.patientsService.add(patient);
            res.status(STATUS_CODES.CREATED).json(patient);
        } catch (err) {
            res.sendStatus(err.statusCode);            
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
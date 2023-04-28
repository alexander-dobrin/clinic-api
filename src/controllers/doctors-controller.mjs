import { STATUS_CODES } from "../enums.mjs";

export class DoctorsController {
    constructor(doctorsService) {
        this.doctorsService = doctorsService;
    }

    get(req, res) {
        const doctors = this.doctorsService.getAll();
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
        const added = this.doctorsService.create(req.body);
        res.status(STATUS_CODES.CREATED).json(added);
    }

    put(req, res) {
        req.body.id = req.params.id;
        const updated = this.doctorsService.update(req.body);
        if (!updated) {
            res.sendStatus(STATUS_CODES.NOT_FOUND);
            return;
        }
        res.json(updated);
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
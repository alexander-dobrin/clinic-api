import { STATUS_CODES } from "../enums.mjs";

export class DoctorsController {
    constructor(doctorsService) {
        this.doctorsService = doctorsService;
    }

    get(req, res) {
        const doctors = this.doctorsService.getAll();

        if(doctors.length < 1) {
            res.satus(STATUS_CODES.NO_CONTENT);
        }

        res.json(doctors);
    }

    getById(req, res) {
        const doctor = this.doctorsService.getById(req.params.id);

        if (!doctor) {
            res.sendStatus(STATUS_CODES.NOT_FOUND);
        }

        res.json(doctor);
    }

    post(req, res) {
        const added = this.doctorsService.add(req.body);
        res.status(STATUS_CODES.CREATED).json(added);
    }

    put(req, res) {
        try {
            const updated = this.doctorsService.update(req.params.id, req.body);
            res.json(updated);
        } catch (err) {
            res.status(STATUS_CODES.BAD_REQUEST).send(err.message);
        }
    }

    delete(req, res) {
        try {
            const removed = this.doctorsService.delete(req.params.id);
            res.json(removed);
        } catch (err) {
            res.status(STATUS_CODES.BAD_REQUEST).send(err.message);
        }
    }
}
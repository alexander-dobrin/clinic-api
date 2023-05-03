import { StatusCodes } from '../enums/status-codes';
import PatientsService from '../services/patients-service';
import { Request, Response, NextFunction } from 'express';

export default class PatientsController {
    private readonly patientsService: PatientsService;

    constructor(patientsService: PatientsService) {
        this.patientsService = patientsService;
    }

    public async get(req: Request, res: Response) {
        const patients = await this.patientsService.getAllPatients();
        if (patients.length < 1) {
            res.status(StatusCodes.NO_CONTENT);
        }
        res.json(patients);
    }

    public async getById(req: Request, res: Response) {
        const patient = await this.patientsService.getPatientById(req.params.id);
        if (!patient) {
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }
        res.json(patient);
    }

    public async post(req: Request, res: Response, next: NextFunction) {
        try {
            const patient = await this.patientsService.createPatient(req.body);
            res.status(StatusCodes.CREATED).json(patient);
        } catch (err) {
            next(err);
        }
    }

    public async put(req: Request, res: Response, next: NextFunction) {
        try {
            const patient = await this.patientsService.updatePatientById(req.params.id, req.body);
            if (!patient) {
                res.sendStatus(StatusCodes.NOT_FOUND);
                return;
            }
            res.json(patient);
        } catch (err) {
            next(err);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const patient = await this.patientsService.deletePatientById(req.params.id);
            if (!patient) {
                res.sendStatus(StatusCodes.NOT_FOUND);
                return;
            }
            res.json(patient);
        } catch (err) {
            next(err);
        }
    }
}
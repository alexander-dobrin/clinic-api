import { StatusCodeEnum } from '../common/enums'; 
import { Request, Response, NextFunction } from 'express';
import { IHttpController } from '../common/types';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { CONTAINER_TYPES } from '../common/constants';
import { IPatientsService } from './patients-service-interface';

@injectable()
export default class PatientsController implements IHttpController {
    constructor(
        @inject(CONTAINER_TYPES.PATIENTS_SERVICE) private readonly patientsService: IPatientsService
    ) {

    }

    public async get(req: Request, res: Response): Promise<void> {
        const patients = await this.patientsService.getAllPatients();
        if (patients.length < 1) {
            res.status(StatusCodeEnum.NO_CONTENT);
        }
        res.json(patients);
    }

    public async getById(req: Request, res: Response): Promise<void> {
        const patient = await this.patientsService.getPatientById(req.params.id);
        if (!patient) {
            res.sendStatus(StatusCodeEnum.NOT_FOUND);
            return;
        }
        res.json(patient);
    }

    public async post(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const patient = await this.patientsService.createPatient(req.body);
            res.status(StatusCodeEnum.CREATED).json(patient);
        } catch (err) {
            next(err);
        }
    }

    public async put(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const patient = await this.patientsService.updatePatientById(req.params.id, req.body);
            if (!patient) {
                res.sendStatus(StatusCodeEnum.NOT_FOUND);
                return;
            }
            res.json(patient);
        } catch (err) {
            next(err);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const patient = await this.patientsService.deletePatientById(req.params.id);
            if (!patient) {
                res.sendStatus(StatusCodeEnum.NOT_FOUND);
                return;
            }
            res.json(patient);
        } catch (err) {
            next(err);
        }
    }
}
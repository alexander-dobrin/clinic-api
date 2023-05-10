import { StatusCodeEnum } from "../common/enums"; 
import { Request, Response, NextFunction } from "express";
import { IHttpController } from "../common/types";
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { CONTAINER_TYPES } from "../common/constants";
import { IDoctorsService } from "./doctors-service-interface";

@injectable()
export default class DoctorsController implements IHttpController {
    constructor(
        @inject(CONTAINER_TYPES.DOCTORS_SERVICE) private readonly doctorsService: IDoctorsService
    ) {

    }

    public async get(req: Request, res: Response): Promise<void> {
        const doctors = await this.doctorsService.getAllDoctors();
        if(doctors.length < 1) {
            res.status(StatusCodeEnum.NO_CONTENT);
        }
        res.json(doctors);
    }

    public async getById(req: Request, res: Response): Promise<void> {
        const doctor = await this.doctorsService.getDoctortById(req.params.id);
        if (!doctor) {
            res.sendStatus(StatusCodeEnum.NOT_FOUND);
            return;
        }
        res.json(doctor);
    }

    public async post(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const doctor = await this.doctorsService.createDoctor(req.body);
            res.status(StatusCodeEnum.CREATED).json(doctor);
        } catch (err) {
            next(err);
        }
    }

    public async put(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const doctor = await this.doctorsService.updateDoctorById(req.params.id, req.body);
            if (!doctor) {
                res.sendStatus(StatusCodeEnum.NOT_FOUND);
                return;
            }
            res.json(doctor);
        } catch (err) {
            next(err);
        }
    }

    public async delete(req: Request, res: Response): Promise<void> {
        const doctor = await this.doctorsService.deleteDoctorById(req.params.id);
        if (!doctor) {
            res.sendStatus(StatusCodeEnum.NOT_FOUND);
            return;
        }
        res.json(doctor);
    }
}
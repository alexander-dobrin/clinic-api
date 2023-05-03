import { StatusCodes } from "../enums/status-codes";
import DoctorsService from "../services/doctors-service";
import { Request, Response, NextFunction } from "express";

export default class DoctorsController {
    private readonly doctorsService: DoctorsService;

    constructor(doctorsService: DoctorsService) {
        this.doctorsService = doctorsService;
    }

    public async get(req: Request, res: Response): Promise<void> {
        const doctors = await this.doctorsService.getAllDoctors({ sortBy: req.query.sortBy as string });
        if(doctors.length < 1) {
            res.status(StatusCodes.NO_CONTENT);
        }
        res.json(doctors);
    }

    public async getById(req: Request, res: Response): Promise<void> {
        const doctor = await this.doctorsService.geDoctortById(req.params.id);
        if (!doctor) {
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }
        res.json(doctor);
    }

    public async post(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const doctor = await this.doctorsService.createDoctor(req.body);
            res.status(StatusCodes.CREATED).json(doctor);
        } catch (err) {
            next(err);
        }
    }

    public async put(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const doctor = await this.doctorsService.updateDoctorById(req.params.id, req.body);
            if (!doctor) {
                res.sendStatus(StatusCodes.NOT_FOUND);
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
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }
        res.json(doctor);
    }
}
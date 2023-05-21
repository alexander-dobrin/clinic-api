import { StatusCodeEnum } from '../common/enums';
import { Request, Response, NextFunction } from 'express';
import { IHttpController } from '../common/types';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { AuthorizedRequest } from '../common/middlewares/auth-middleware';
import PatientService from './patient-service';

@injectable()
export default class PatientController implements IHttpController {
	constructor(
		@inject(CONTAINER_TYPES.PATIENTS_SERVICE) private readonly patientsService: PatientService,
	) {}

	public async get(req: Request, res: Response): Promise<void> {
		const patients = await this.patientsService.getAllPatients(req.query);
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

	// Review: у пациента теперь часть полей находится в сущности пользователя
	// значит ли это, что для создания пациента теперь необходима авторизация, ведь в ней
	// и находятся данные о пользователе
	public async post(req: AuthorizedRequest, res: Response, next: NextFunction): Promise<void> {
		try {
			const patient = await this.patientsService.createPatient(req.body, req.user);
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

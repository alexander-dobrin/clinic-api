import { StatusCodeEnum } from '../common/enums';
import { Request, Response, NextFunction } from 'express';
import { IHttpController, IQueryParams } from '../common/types';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { AuthorizedRequest } from '../auth/auth-middleware';
import { PatientService } from './patient-service';
import { CreatePatientDto } from './dto/create-patient-dto';
import { UpdatePatientDto } from './dto/update-patient-dto';

@injectable()
export class PatientController implements IHttpController {
	constructor(
		@inject(CONTAINER_TYPES.PATIENTS_SERVICE) private readonly patientsService: PatientService,
	) {}

	public async get(
		req: Request<object, object, object, IQueryParams>,
		res: Response,
	): Promise<void> {
		const patients = await this.patientsService.read(req.query);
		if (patients.length < 1) {
			res.status(StatusCodeEnum.NO_CONTENT);
		}
		res.json(patients);
	}

	public async getById(req: Request<{ id: string }>, res: Response): Promise<void> {
		const patient = await this.patientsService.readById(req.params.id);
		if (!patient) {
			res.sendStatus(StatusCodeEnum.NOT_FOUND);
			return;
		}
		res.json(patient);
	}

	public async post(
		req: AuthorizedRequest<CreatePatientDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const patient = await this.patientsService.create(req.body, req.user);
			res.status(StatusCodeEnum.CREATED).json(patient);
		} catch (err) {
			next(err);
		}
	}

	public async put(
		req: Request<{ id: string }, object, UpdatePatientDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
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

	public async delete(
		req: Request<{ id: string }>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
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

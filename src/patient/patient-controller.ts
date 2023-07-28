import { StatusCodeEnum } from '../common/enums';
import { Request, Response, NextFunction } from 'express';
import { GetOptions, IHttpController } from '../common/types';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { AuthorizedRequest } from '../auth/auth-types';
import { PatientService } from './patient-service';
import { CreatePatientDto } from './dto/create-patient-dto';
import { UpdatePatientDto } from './dto/update-patient-dto';

@injectable()
export class PatientController implements IHttpController {
	constructor(
		@inject(CONTAINER_TYPES.PATIENT_SERVICE) private readonly patientsService: PatientService,
	) {}

	public async get(
		req: Request<object, object, object, GetOptions>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const patients = await this.patientsService.get(req.query);
			res.json(patients);
		} catch (err) {
			next(err);
		}
	}

	public async getById(
		req: Request<{ id: string }>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const patient = await this.patientsService.getById(req.params.id);
			res.json(patient);
		} catch (err) {
			next(err);
		}
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
			const patient = await this.patientsService.update(req.params.id, req.body);
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
			await this.patientsService.delete(req.params.id);
			res.sendStatus(StatusCodeEnum.OK);
		} catch (err) {
			next(err);
		}
	}
}

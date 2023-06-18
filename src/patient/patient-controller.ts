import { StatusCodeEnum } from '../common/enums';
import { Request, Response, NextFunction } from 'express';
import { GetOptions, IHttpController } from '../common/types';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { AuthorizedRequest } from '../auth/auth-types';
import { PatientService } from './patient-service';
import { CreatePatientDto } from './dto/create-patient-dto';
import { UpdatePatientDto } from './dto/update-patient-dto';
import { instanceToPlain } from 'class-transformer';

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
			if (patients.length < 1) {
				res.status(StatusCodeEnum.NO_CONTENT);
			}
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
			if (!patient) {
				res.sendStatus(StatusCodeEnum.NOT_FOUND);
				return;
			}
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
			res.status(StatusCodeEnum.CREATED).json(instanceToPlain(patient));
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
			await this.patientsService.deletePatientById(req.params.id);
			res.sendStatus(StatusCodeEnum.NO_CONTENT);
		} catch (err) {
			next(err);
		}
	}
}

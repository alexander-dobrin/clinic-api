import { StatusCodeEnum } from '../common/enums';
import { Request, Response, NextFunction } from 'express';
import { IQueryParams, IHttpController } from '../common/types';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { DoctorService } from './doctor-service';
import { CreateDoctorDto } from './dto/create-doctor-dto';
import { UpdateDoctorDto } from './dto/update-doctor-dto';
import { AuthorizedRequest } from '../auth/auth-middleware';

@injectable()
export class DoctorController implements IHttpController {
	constructor(
		@inject(CONTAINER_TYPES.DOCTORS_SERVICE) private readonly doctorsService: DoctorService,
	) {}

	public async get(
		req: Request<object, object, IQueryParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const doctors = await this.doctorsService.read(req.query);
			if (doctors.length < 1) {
				res.status(StatusCodeEnum.NO_CONTENT);
			}
			res.json(doctors);
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
			const doctor = await this.doctorsService.getById(req.params.id);
			res.json(doctor);
		} catch (err) {
			next(err);
		}
	}

	public async post(
		req: AuthorizedRequest<CreateDoctorDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const doctor = await this.doctorsService.createDoctor(req.body, req.user);
			res.status(StatusCodeEnum.CREATED).json(doctor);
		} catch (err) {
			next(err);
		}
	}

	public async put(
		req: Request<{ id: string }, object, UpdateDoctorDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const doctor = await this.doctorsService.update(req.params.id, req.body);
			res.json(doctor);
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
			const doctor = await this.doctorsService.delete(req.params.id);
			res.json(doctor);
		} catch (err) {
			next(err);
		}
	}
}

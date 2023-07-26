import { StatusCodeEnum } from '../common/enums';
import { AppointmentService } from './appointment-service';
import { Request, Response, NextFunction } from 'express';
import { GetOptions, IHttpController } from '../common/types';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { CreateAppointmentDto } from './dto/create-appointment-dto';
import { UpdateAppointmentDto } from './dto/update-appointment-dto';
import { }from 'class-transformer';

@injectable()
export class AppointmentController implements IHttpController {
	constructor(
		@inject(CONTAINER_TYPES.APPOINTMENT_SERVICE)
		private readonly appointmentService: AppointmentService,
	) {}

	public async post(
		req: Request<object, object, CreateAppointmentDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const created = await this.appointmentService.create(req.body);
			res.status(StatusCodeEnum.CREATED).json(created);
		} catch (err) {
			next(err);
		}
	}

	public async get(
		req: Request<object, object, object, GetOptions>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const appointments = await this.appointmentService.get(req.query);
			res.json(appointments);
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
			const appointment = await this.appointmentService.getById(req.params.id);
			res.json(appointment);
		} catch (err) {
			next(err);
		}
	}

	public async put(
		req: Request<{ id: string }, object, UpdateAppointmentDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const updated = await this.appointmentService.update(req.params.id, req.body);
			res.setHeader('X-Entity-Version', updated.version).json(updated);
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
			await this.appointmentService.delete(req.params.id);
			res.sendStatus(StatusCodeEnum.OK);
		} catch (err) {
			next(err);
		}
	}
}

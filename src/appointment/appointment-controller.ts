import { StatusCodeEnum } from '../common/enums';
import AppointmentService from './appointment-service';
import { Request, Response, NextFunction } from 'express';
import { IHttpController, IQueryParams } from '../common/types';
import { injectable, inject } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { CreateAppointmentDto } from './dto/create-appointment-dto';
import { UpdateAppointmentDto } from './dto/update-appointment-dto';

@injectable()
export default class AppointmentController implements IHttpController {
	constructor(
		@inject(CONTAINER_TYPES.APPOINTMENTS_SERVICE)
		private readonly appointmentService: AppointmentService,
	) {}

	public async post(
		req: Request<object, object, CreateAppointmentDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const created = await this.appointmentService.createAppointment(req.body);
			if (!created) {
				res.sendStatus(StatusCodeEnum.NOT_FOUND);
				return;
			}
			res.status(StatusCodeEnum.CREATED).json(created);
		} catch (err) {
			next(err);
		}
	}

	public async get(
		req: Request<object, object, object, IQueryParams>,
		res: Response,
	): Promise<void> {
		const appointments = await this.appointmentService.getAllAppointments(req.query);
		if (appointments.length < 1) {
			res.status(StatusCodeEnum.NO_CONTENT);
		}
		res.json(appointments);
	}

	public async getById(req: Request<{ id: string }>, res: Response): Promise<void> {
		const appointment = await this.appointmentService.getAppointmentById(req.params.id);
		if (!appointment) {
			res.sendStatus(StatusCodeEnum.NOT_FOUND);
			return;
		}
		res.json(appointment);
	}

	public async put(
		req: Request<{ id: string }, object, UpdateAppointmentDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const updated = await this.appointmentService.updateAppointmentById(req.params.id, req.body);
			if (!updated) {
				res.sendStatus(StatusCodeEnum.NOT_FOUND);
				return;
			}
			res.json(updated);
		} catch (err) {
			next(err);
		}
	}

	public async delete(req: Request<{ id: string }>, res: Response): Promise<void> {
		const removed = await this.appointmentService.deleteAppointmentById(req.params.id);
		if (!removed) {
			res.sendStatus(StatusCodeEnum.NOT_FOUND);
			return;
		}
		res.json(removed);
	}
}

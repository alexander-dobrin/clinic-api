import express, { Express } from 'express';
import { ErrorFilterMiddleware } from './common/middleware/error-filter-middleware';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { CONTAINER_TYPES } from './common/constants';
import { IRoutes } from './common/types';
import cookieParser from 'cookie-parser';

@injectable()
export class App {
	private readonly app: Express;

	constructor(
		@inject(CONTAINER_TYPES.PATIENT_ROUTES) private readonly patientsRoutes: IRoutes,
		@inject(CONTAINER_TYPES.DOCTOR_ROUTES) private readonly doctorsRoutes: IRoutes,
		@inject(CONTAINER_TYPES.APPOINTMENT_ROUTES) private readonly appointmentsRoutes: IRoutes,
		@inject(CONTAINER_TYPES.AUTH_ROUTES) private readonly authRoutes: IRoutes,
		@inject(CONTAINER_TYPES.USER_ROUTES) private readonly userRoutes: IRoutes,
		@inject(CONTAINER_TYPES.ERROR_FILTER_MIDDLEWARE)
		private readonly exceptionFilter: ErrorFilterMiddleware,
	) {
		this.app = express();

		this.setupMiddlewares();
		this.setupRoutes();
		this.setupErrorFilters();
	}

	private setupMiddlewares(): void {
		this.app.use(express.json());
		this.app.use(cookieParser());
	}

	private setupErrorFilters(): void {
		this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
	}

	private setupRoutes(): void {
		this.app.use('/patients', this.patientsRoutes.router);
		this.app.use('/doctors', this.doctorsRoutes.router);
		this.app.use('/appointments', this.appointmentsRoutes.router);
		this.app.use('/', this.authRoutes.router);
		this.app.use('/users', this.userRoutes.router);
	}

	public listen(port): void {
		this.app.listen(port);
	}
}

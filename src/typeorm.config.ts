import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { UserModel } from './user/user-model';
import { PatientModel } from './patient/patient-model';
import { DoctorModel } from './doctor/doctor-model';
import { AppointmentModel } from './appointment/appointment-model';

dotenv.config();

export const AppDataSource = new DataSource({
	type: 'postgres',
	username: process.env.PGUSER,
	host: process.env.PGHOST,
	database: process.env.PGDATABASE,
	port: Number(process.env.PGPORT),
	synchronize: true,
	entities: [UserModel, PatientModel, DoctorModel, AppointmentModel],
	migrations: [],
	useUTC: true,
});

import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../user/user';
import { Patient } from '../patient/patient';
import { Doctor } from '../doctor/doctor';
import { Appointment } from '../appointment/appointment';
import { InitialPopulation1685954857153 } from './migration/1685954857153-initialPopulation';
import { Token } from '../token/token';

dotenv.config();

export const AppDataSource = new DataSource({
	type: 'postgres',
	username: process.env.PGUSER,
	host: process.env.PGHOST,
	database: process.env.PGDATABASE,
	port: Number(process.env.PGPORT),
	synchronize: true,
	entities: [User, Patient, Doctor, Appointment, Token],
	migrations: [InitialPopulation1685954857153],
	useUTC: true,
});

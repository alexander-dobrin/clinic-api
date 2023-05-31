import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { UserModel } from './user/user-model';

dotenv.config();

export const AppDataSource = new DataSource({
	type: 'postgres',
	username: process.env.PGUSER,
	host: process.env.PGHOST,
	database: process.env.PGDATABASE,
	port: Number(process.env.PGPORT),
	synchronize: true,
	entities: [UserModel],
	migrations: [],
});



import dotenv from 'dotenv';
import { App } from './app';
import { iocContainer } from './common/config/inversify.config';
import { CONTAINER_TYPES } from './common/constants';
import { AppDataSource } from './common/config/typeorm.config';

dotenv.config();

AppDataSource.initialize().then(() => {
	const app = iocContainer.get<App>(CONTAINER_TYPES.APP);
	app.listen(process.env.PORT);
});

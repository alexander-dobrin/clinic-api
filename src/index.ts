import dotenv from 'dotenv';
import { App } from './app';
import { iocContainer } from './inversify.config';
import { CONTAINER_TYPES } from './common/constants';
import { AppDataSource } from './typeorm.config';

dotenv.config();

AppDataSource.initialize().then(() => {
    const app = iocContainer.get<App>(CONTAINER_TYPES.APP);
    app.listen(process.env.PORT);    
});
import dotenv from 'dotenv';
import { App } from './app';
import { iocContainer } from './inversify.config';
import { CONTAINER_TYPES } from './common/constants';

dotenv.config();

const app = iocContainer.get<App>(CONTAINER_TYPES.APP);
app.listen(process.env.PORT);

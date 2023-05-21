import { ContainerModule } from 'inversify';
import { IUser } from './user-interface';
import { CONTAINER_TYPES } from '../common/constants';
import FileDataProvider from '../common/providers/file-data-provider';
import { resolve } from 'path';
import { IDataProvider } from '../common/types';
import UserService from './user-service';
import UserRoutes from './user-routes';
import { UserController } from './user-controller';

export const userModule = new ContainerModule((bind) => {
	bind<UserRoutes>(CONTAINER_TYPES.USER_ROUTES).to(UserRoutes);
	bind<UserController>(CONTAINER_TYPES.USER_CONTROLLER).to(UserController);
	bind<UserService>(CONTAINER_TYPES.USER_SERVICE).to(UserService);
	bind<IDataProvider<IUser>>(CONTAINER_TYPES.USER_DATA_PROVIDER)
		.toDynamicValue(() => new FileDataProvider(resolve('assets', 'users.json')))
		.inSingletonScope();
});

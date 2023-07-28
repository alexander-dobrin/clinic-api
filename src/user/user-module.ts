import { ContainerModule } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { UserService } from './user-service';
import { UserRoutes } from './user-routes';
import { UserController } from './user-controller';

export const userModule = new ContainerModule((bind) => {
	bind<UserRoutes>(CONTAINER_TYPES.USER_ROUTES).to(UserRoutes).inSingletonScope();
	bind<UserController>(CONTAINER_TYPES.USER_CONTROLLER).to(UserController).inSingletonScope();
	bind<UserService>(CONTAINER_TYPES.USER_SERVICE).to(UserService).inSingletonScope();
});

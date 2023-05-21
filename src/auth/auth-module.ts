import { ContainerModule } from 'inversify';
import AuthController from './auth-controller';
import { CONTAINER_TYPES } from '../common/constants';
import { AuthRoutes } from './auth-routes';
import { AuthService } from './auth-service';

export const authModule = new ContainerModule((bind) => {
	bind<AuthController>(CONTAINER_TYPES.AUTH_CONTROLLER).to(AuthController).inSingletonScope();
	bind<AuthRoutes>(CONTAINER_TYPES.AUTH_ROUTES).to(AuthRoutes);
	bind<AuthService>(CONTAINER_TYPES.AUTH_SERVICE).to(AuthService);
});

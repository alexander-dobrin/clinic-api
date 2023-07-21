import { ContainerModule } from 'inversify';
import { TokenService } from './token-service';
import { CONTAINER_TYPES } from '../common/constants';

export const tokenModule = new ContainerModule((bind) => {
	bind<TokenService>(CONTAINER_TYPES.TOKEN_SERVICE).to(TokenService).inSingletonScope();
});

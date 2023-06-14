import { ContainerModule } from 'inversify';
import { TokenService } from './token-service';
import { CONTAINER_TYPES } from '../common/constants';
import { TokenRepository } from './token-repository';
import { iocContainer } from '../inversify.config';
import { DataSource } from 'typeorm';

export const tokenModule = new ContainerModule((bind) => {
	bind<TokenService>(CONTAINER_TYPES.TOKEN_SERVICE).to(TokenService).inSingletonScope();
	bind<TokenRepository>(CONTAINER_TYPES.TOKEN_REPOSITORY)
		.toDynamicValue(() => {
			const provider = iocContainer.get<DataSource>(CONTAINER_TYPES.DB_CONNECTION);
			return new TokenRepository(provider);
		})
		.inSingletonScope();
});

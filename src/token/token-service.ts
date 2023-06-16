import { inject, injectable } from 'inversify';
import { TokenPair } from './token-types';
import { UserPayload } from '../auth/auth-types';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { StatusCodeEnum, TokenLifetimeEnum } from '../common/enums';
import { CONTAINER_TYPES } from '../common/constants';
import { TokenRepository } from './token-repository';
import { Token } from './token';
import { User } from '../user/user';
import { HttpError } from '../common/errors';
import { EntityNotFoundError } from 'typeorm';

@injectable()
export class TokenService {
	constructor(
		@inject(CONTAINER_TYPES.TOKEN_REPOSITORY) private readonly tokenRepository: TokenRepository,
	) {}

	public generatePair(payload: UserPayload): TokenPair {
		const plainObject = { id: payload.id, email: payload.email, role: payload.role };
		const accessToken = jwt.sign(plainObject, process.env.JWT_ACCESS_SECRET, {
			expiresIn: TokenLifetimeEnum.ACCESS_TOKEN,
		});
		const refreshToken = jwt.sign(plainObject, process.env.JWT_REFRESH_SECRET, {
			expiresIn: TokenLifetimeEnum.REFRESH_TOKEN,
		});
		return { accessToken, refreshToken };
	}

	public decodeAccessTokenOrFail(token: string): UserPayload {
		try {
			return jwt.verify(token, process.env.JWT_ACCESS_SECRET) as UserPayload;
		} catch (err) {
			throw new JsonWebTokenError('Invalid token');
		}
	}

	public async getRefreshTokenUser(token: string): Promise<User> {
		if (!token) {
			throw new HttpError(StatusCodeEnum.NOT_AUTHORIZED, 'Refresh token not provided');
		}
		try {
			const hashedToken = jwt.verify(token, process.env.JWT_REFRESH_SECRET) as UserPayload;
			const refreshToken = await this.tokenRepository.findOne({
				where: { userId: hashedToken.id },
				relations: { user: true },
			});
			return refreshToken.user;
		} catch (err) {
			throw new JsonWebTokenError('Invalid token');
		}
	}

	public async create(user: User, refreshToken: string): Promise<Token> {
		const tokenData = await this.tokenRepository.findOneBy({ user });
		if (tokenData) {
			tokenData.refreshToken = refreshToken;
			return this.tokenRepository.save(tokenData);
		}
		const token = new Token();
		token.refreshToken = refreshToken;
		token.user = user;
		return this.tokenRepository.save(token);
	}

	public async get(refreshToken: string) {
		return this.tokenRepository.findOneBy({ refreshToken });
	}

	public async delete(refreshToken: string): Promise<string> {
		try {
			const token = await this.tokenRepository.findOneByOrFail({ refreshToken });
			await this.tokenRepository.delete(token.id);
			return token.refreshToken;
		} catch (err) {
			if (err instanceof EntityNotFoundError) {
				throw new HttpError(StatusCodeEnum.BAD_REQUEST, 'Allready logged out');
			}
		}
	}

	public generateLogoutToken() {
		return jwt.sign({ id: -1 }, '-1');
	}
}

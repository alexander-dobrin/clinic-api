import { inject, injectable } from 'inversify';
import { TokenPair } from './token-types';
import { UserPayload } from '../auth/auth-types';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { StatusCodeEnum, TokenLifetimeEnum } from '../common/enums';
import { CONTAINER_TYPES } from '../common/constants';
import { Token } from './token';
import { User } from '../user/user';
import { HttpError } from '../common/errors';
import { DataSource, Repository } from 'typeorm';

@injectable()
export class TokenService {
	private readonly tokenRepository: Repository<Token>;

	constructor(@inject(CONTAINER_TYPES.DB_CONNECTION) private readonly dataSource: DataSource) {
		this.tokenRepository = dataSource.getRepository(Token);
	}

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

	public async create(userId: string, refreshToken: string): Promise<Token> {
		const tokenData = await this.tokenRepository.findOneBy({ userId });
		if (tokenData) {
			tokenData.refreshToken = refreshToken;
			return this.tokenRepository.save(tokenData);
		}
		const token = new Token();
		token.refreshToken = refreshToken;
		token.userId = userId;
		return this.tokenRepository.save(token);
	}

	public async get(refreshToken: string) {
		return this.tokenRepository.findOneBy({ refreshToken });
	}

	public async delete(refreshToken: string) {
		try {
			const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as UserPayload;
			const token = await this.tokenRepository.findOneByOrFail({ userId: payload.id });
			await this.tokenRepository.delete(token.id);
		} catch (err) {
			throw new HttpError(StatusCodeEnum.BAD_REQUEST, 'Allready logged out');
		}
	}

	public generateLogoutToken() {
		return jwt.sign({ id: -1 }, '-1');
	}
}

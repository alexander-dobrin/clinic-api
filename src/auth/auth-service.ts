import { inject, injectable } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { HttpError } from '../common/errors';
import { ErrorMessageEnum, StatusCodeEnum, TokenLifetimeEnum } from '../common/enums';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserService } from '../user/user-service';
import { UpdateUserDto } from '../user/dto/update-user-dto';
import { LoginDto } from './dto/login-dto';
import { RegisterDto } from './dto/register-dto';
import { AuthedUser, UserPayload } from './auth-types';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { RecoverPasswordDto } from './dto/recover-password-dto';
import { validDto, validateDto } from '../common/decorator/validate-dto';
import { TokenService } from '../token/token-service';

@injectable()
export class AuthService {
	constructor(
		@inject(CONTAINER_TYPES.USER_SERVICE) private readonly userService: UserService,
		@inject(CONTAINER_TYPES.TOKEN_SERVICE) private readonly tokenService: TokenService,
	) {}

	@validateDto
	public async register(@validDto(RegisterDto) registerData: RegisterDto): Promise<AuthedUser> {
		const createdUser = await this.userService.create(registerData);
		const tokens = this.tokenService.generatePair(createdUser);
		await this.tokenService.create(createdUser, tokens.refreshToken);
		return {
			user: { email: createdUser.email, role: createdUser.role, id: createdUser.id },
			...tokens,
		};
	}

	@validateDto
	public async login(@validDto(LoginDto) loginData: LoginDto): Promise<AuthedUser> {
		const foundUser = await this.userService.getByEmail(loginData.email);
		const isPasswordsMatch = await bcrypt.compare(loginData.password, foundUser.password);
		if (!isPasswordsMatch) {
			throw new HttpError(StatusCodeEnum.NOT_AUTHORIZED, ErrorMessageEnum.INCORRECT_PASSWORD);
		}
		const tokens = this.tokenService.generatePair(foundUser);
		await this.tokenService.create(foundUser, tokens.refreshToken);
		return { user: { email: foundUser.email, role: foundUser.role, id: foundUser.id }, ...tokens };
	}

	public async refresh(refreshToken?: string) {
		const userPayload = this.tokenService.decodeRefreshTokenOrFail(refreshToken);
		const tokenData = await this.tokenService.get(refreshToken);
		if (!userPayload || !tokenData) {
			throw new HttpError(StatusCodeEnum.NOT_AUTHORIZED, 'Undefined refresh token');
		}
		const user = await this.userService.getById(userPayload.id);
		const tokens = this.tokenService.generatePair(user);
		await this.tokenService.create(user, tokens.refreshToken);
		return { user: { email: user.email, role: user.role, id: user.id }, ...tokens };
	}

	@validateDto
	public async resetPassword(@validDto(ResetPasswordDto) resetData: ResetPasswordDto) {
		const user = await this.userService.getByEmail(resetData.email);
		const resetToken = this.signTokenForUser(user as UserPayload, TokenLifetimeEnum.RESET_TOKEN);
		await this.userService.updateResetToken(resetData.email, resetToken);
		return { resetToken };
	}

	@validateDto
	public async recoverPassword(@validDto(RecoverPasswordDto) recoverData: RecoverPasswordDto) {
		const { resetToken, password } = recoverData;
		jwt.verify(resetToken, process.env.JWT_ACCESS_SECRET);
		const user = await this.userService.getByResetToken(resetToken);
		await this.userService.update(
			user.id,
			new UpdateUserDto(user.email, password, user.firstName, user.role, null),
		);
	}

	// TODO: Move to token service or delete
	private signTokenForUser(user: UserPayload, lifetime: string) {
		return jwt.sign(
			{
				email: user.email,
				role: user.role,
				id: user.id,
			},
			process.env.JWT_ACCESS_SECRET,
			{
				expiresIn: lifetime,
			},
		);
	}
}

import { inject, injectable } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { HttpError } from '../common/errors';
import { StatusCodeEnum } from '../common/enums';
import bcrypt from 'bcrypt';
import { UserService } from '../user/user-service';
import { LoginDto } from './dto/login-dto';
import { RegisterDto } from './dto/register-dto';
import { AuthedUser } from './auth-types';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { RecoverPasswordDto } from './dto/recover-password-dto';
import { validDto, validateDto } from '../common/decorator/validate-dto';
import { TokenService } from '../token/token-service';
import { v4 } from 'uuid';
import { MailUtils } from '../common/util/mail-utils';
import { merge } from 'lodash';

@injectable()
export class AuthService {
	constructor(
		@inject(CONTAINER_TYPES.USER_SERVICE) private readonly userService: UserService,
		@inject(CONTAINER_TYPES.TOKEN_SERVICE) private readonly tokenService: TokenService,
	) {}

	@validateDto
	public async register(@validDto(RegisterDto) registerData: RegisterDto): Promise<AuthedUser> {
		const activationLink = v4();
		const createdUser = await this.userService.create(merge(registerData, { activationLink }));

		MailUtils.sendActivationMail(
			createdUser.email,
			`${process.env.API_URL}/activate/${activationLink}`,
		);

		const tokens = this.tokenService.generatePair(createdUser);
		await this.tokenService.create(createdUser.id, tokens.refreshToken);
		return {
			user: { email: createdUser.email, role: createdUser.role, id: createdUser.id },
			...tokens,
		};
	}

	public async activate(activationLink: string) {
		await this.userService.activate(activationLink);
	}

	@validateDto
	public async login(@validDto(LoginDto) loginData: LoginDto): Promise<AuthedUser> {
		try {
			const foundUser = await this.userService.getByEmail(loginData.email);
			this.verifyPassword(loginData.password, foundUser.password);
			const tokens = this.tokenService.generatePair(foundUser);
			await this.tokenService.create(foundUser.id, tokens.refreshToken);
			return {
				user: { email: foundUser.email, role: foundUser.role, id: foundUser.id },
				...tokens,
			};
		} catch (err) {
			throw new HttpError(StatusCodeEnum.NOT_AUTHORIZED, 'Wrong credentials');
		}
	}

	private verifyPassword(plainTextPassword: string, hashedPassword: string) {
		const isPasswordMatching = bcrypt.compareSync(plainTextPassword, hashedPassword);
		if (!isPasswordMatching) {
			throw new HttpError(StatusCodeEnum.NOT_AUTHORIZED, 'Wrong credentials');
		}
	}

	public async logout(refreshToken: string) {
		await this.tokenService.delete(refreshToken);
		const token = this.tokenService.generateLogoutToken();
		return { refreshToken: v4(), accessToken: token };
	}

	public async refresh(refreshToken?: string) {
		const user = await this.tokenService.getRefreshTokenUser(refreshToken);
		if (!user) {
			throw new HttpError(StatusCodeEnum.NOT_AUTHORIZED, 'Invalid refresh token');
		}
		const tokens = this.tokenService.generatePair(user);
		await this.tokenService.create(user.id, tokens.refreshToken);
		return { user: { email: user.email, role: user.role, id: user.id }, ...tokens };
	}

	@validateDto
	public async resetPassword(@validDto(ResetPasswordDto) resetData: ResetPasswordDto) {
		const resetToken = v4();
		await this.userService.updateResetToken(resetData.email, resetToken);
		return { resetToken };
	}

	@validateDto
	public async recoverPassword(@validDto(RecoverPasswordDto) recoverData: RecoverPasswordDto) {
		const { resetToken, password } = recoverData;
		await this.userService.setNewPassword(resetToken, password);
	}
}

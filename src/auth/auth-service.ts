import { inject, injectable } from 'inversify';
import { CONTAINER_TYPES } from '../common/constants';
import { HttpError } from '../common/errors';
import { StatusCodeEnum, UserRoleEnum } from '../common/enums';
import bcrypt from 'bcrypt';
import { UserService } from '../user/user-service';
import { LoginDto } from './dto/login-dto';
import { RegisterDto } from './dto/register-dto';
import { AuthedUser, UserPayload } from './auth-types';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { RecoverPasswordDto } from './dto/recover-password-dto';
import { validDto, validateDto } from '../common/decorator/validate-dto';
import { TokenService } from '../token/token-service';
import { v4 } from 'uuid';
import { MailService } from '../mail/mail-service';
import { RegisterPatientDto } from './dto/register-patient-dto';
import { CreateUserDto } from '../user/dto/create-user-dto';
import { PatientService } from '../patient/patient-service';
import { CreatePatientDto } from '../patient/dto/create-patient-dto';
import { DataSource, EntityManager } from 'typeorm';

@injectable()
export class AuthService {
	constructor(
		@inject(CONTAINER_TYPES.USER_SERVICE) private readonly userService: UserService,
		@inject(CONTAINER_TYPES.TOKEN_SERVICE) private readonly tokenService: TokenService,
		@inject(CONTAINER_TYPES.PATIENT_SERVICE) private readonly patientService: PatientService,
		@inject(CONTAINER_TYPES.DB_CONNECTION) private readonly dataSource: DataSource,
	) {}

	@validateDto
	public async register(@validDto(RegisterDto) registerData: RegisterDto): Promise<AuthedUser> {
		const user = await this.registerUser(registerData);
		const tokens = this.tokenService.generatePair(user);

		await this.tokenService.create(user.id, tokens.refreshToken);

		return {
			user,
			...tokens,
		};
	}

	private async registerUser(
		dto: CreateUserDto,
		transaction?: EntityManager,
	): Promise<UserPayload> {
		const activationLink = v4();
		const createdUser = await this.userService.create(dto, transaction);

		MailService.sendActivationMail(
			createdUser.email,
			`${process.env.API_URL}/activate/${activationLink}`,
		);

		return { email: createdUser.email, id: createdUser.id, role: createdUser.role };
	}

	public async registerPatient(@validDto(RegisterPatientDto) dto: RegisterPatientDto) {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.startTransaction();

		try {
			const user = await this.registerUser(
				{
					email: dto.email,
					firstName: dto.firstName,
					password: dto.password,
				},
				queryRunner.manager,
			);
			user.role = UserRoleEnum.PATIENT;

			const patient = await this.patientService.create(
				new CreatePatientDto(dto.phoneNumber),
				user,
				queryRunner.manager,
			);

			await queryRunner.commitTransaction();

			const tokens = this.tokenService.generatePair(user);
			await this.tokenService.create(user.id, tokens.refreshToken);

			return {
				user,
				patient,
				...tokens,
			};
		} catch (err) {
			throw err;
		} finally {
			await queryRunner.release();
		}
	}

	// TODO
	public async registerDoctor() {}

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

import { inject, injectable } from 'inversify';
import { GetOptions, IRepository } from '../common/types';
import { IUser } from './user-interface';
import { CONTAINER_TYPES, SALT_ROUNDS } from '../common/constants';
import { HttpError } from '../common/errors';
import { ErrorMessageEnum, StatusCodeEnum } from '../common/enums';
import { merge } from 'lodash';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import bcrypt from 'bcrypt';
import { PatientModel } from '../patient/patient-model';
import { validDto, validateDto } from '../common/decorator';
import { UserModel } from './user-model';
import { UserRepository } from './user-repository';
import { EntityPropertyNotFoundError, QueryFailedError } from 'typeorm';

@injectable()
export class UserService {
	constructor(
		@inject(CONTAINER_TYPES.USER_REPOSITORY) private readonly userRepository: UserRepository,
		@inject(CONTAINER_TYPES.PATIENTS_REPOSITORY)
		private readonly patientsRepository: IRepository<PatientModel>,
	) {}

	@validateDto
	public async create(@validDto(CreateUserDto) user: CreateUserDto): Promise<UserModel> {
		await this.throwIfEmailTaken(user.email);
		const createdUser = new UserModel();
		createdUser.email = user.email.toLowerCase();
		createdUser.role = user.role;
		createdUser.firstName = user.firstName;
		createdUser.password = await bcrypt.hash(user.password, SALT_ROUNDS);
		return await this.userRepository.save(createdUser);
	}

	private async throwIfEmailTaken(email: string): Promise<void> {
		const user = await this.userRepository.findOneBy({ email: email.toLowerCase() });
		if (user) {
			throw new HttpError(
				StatusCodeEnum.BAD_REQUEST,
				`Email adress [${user.email}] is allready in use`,
			);
		}
	}

	public async get(options: GetOptions) {
		try {
			const users = await this.userRepository.find({
				where: options.filter,
				order: options.sort ?? { createdAt: 'DESC' },
			});
			return users;
		} catch (err) {
			if (err instanceof EntityPropertyNotFoundError) {
				throw new HttpError(StatusCodeEnum.BAD_REQUEST, ErrorMessageEnum.UNKNOWN_QUERY_PARAMETER);
			}
			throw err;
		}
	}

	public async getById(id: string) {
		try {
			const user = await this.userRepository.findOneBy({ id });
			if (!user) {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `User [${id}] not found`);
			}
			return user;
		} catch (err) {
			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `User [${id}] not found`);
			}
			throw err;
		}
	}

	public async getByEmail(email: string): Promise<IUser> {
		const user = await this.userRepository.findOneBy({ email: email.toLowerCase() });
		if (!user) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `User does not exist`);
		}
		return user;
	}

	// TODO: ADD TYPES FOR METHODS
	public async getByResetToken(token: string) {
		const user = await this.userRepository.findOneBy({ resetToken: token });
		if (!user) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `User not found`);
		}
		return user;
	}

	public async updateResetToken(email: string, token: string | null): Promise<IUser> {
		const user = await this.getByEmail(email);
		user.resetToken = token;
		return this.userRepository.save(user);
	}

	@validateDto
	public async update(id: string, @validDto(UpdateUserDto) userDto: UpdateUserDto) {
		if (userDto.email) {
			await this.throwIfEmailTaken(userDto.email);
		}
		const user = await this.getById(id);
		if (userDto.password) {
			userDto.password = await bcrypt.hash(userDto.password, SALT_ROUNDS);
		}
		// Review:
		merge(user, userDto);
		return this.userRepository.save(user);
	}

	public async delete(id: string): Promise<void> {
		const res = await this.userRepository.delete(id);
		if (!res.affected) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `User [${id}] not found`);
		}
		await this.deleteAssociatedPatients(id); // TODO: DELETE CASCADE
	}

	private async deleteAssociatedPatients(id: string) {
		const patients = await this.patientsRepository.getAll();
		const patientsToDelete = patients.filter((p) => p.userId === id);
		const promises = patientsToDelete.map((p) => this.patientsRepository.remove(p));
		await Promise.all(promises);
	}
}

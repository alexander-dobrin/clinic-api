import { inject, injectable } from 'inversify';
import { IDataProvider, IRepository } from '../common/types';
import { IUser } from './user-interface';
import { CONTAINER_TYPES, SALT_ROUNDS } from '../common/constants';
import { v4 } from 'uuid';
import { HttpError } from '../common/errors';
import { ErrorMessageEnum, StatusCodeEnum, UserRoleEnum } from '../common/enums';
import { merge } from 'lodash';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import bcrypt from 'bcrypt';
import { PatientModel } from '../patient/patient-model';
import { validDto, validateDto } from '../common/decorator';

@injectable()
export class UserService {
	constructor(
		@inject(CONTAINER_TYPES.USER_DATA_PROVIDER) private readonly provider: IDataProvider<IUser>,
		@inject(CONTAINER_TYPES.PATIENTS_REPOSITORY)
		private readonly patientsRepository: IRepository<PatientModel>,
	) {}

	@validateDto
	public async create(@validDto(CreateUserDto) user: CreateUserDto): Promise<IUser> {
		if (await this.isUserExist(user.email)) {
			throw new HttpError(
				StatusCodeEnum.BAD_REQUEST,
				`Email adress [${user.email}] is allready in use`,
			);
		}
		// Review: should user role be set in UserService or AuthService?
		// Should role be set during login or registration?
		user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
		const newUser: IUser = { id: v4(), role: user.role ?? UserRoleEnum.GUEST, ...user };
		return this.provider.create(newUser);
	}

	private async isUserExist(email: string): Promise<boolean> {
		const users = await this.provider.read();
		return users.some((u) => u.email === email);
	}

	public async get() {
		return this.provider.read();
	}

	public async getById(id: string) {
		const users = await this.provider.read();
		const user = users.find((u) => u.id === id);
		if (!user) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `User [${id}] not found`);
		}
		return user;
	}

	public async getByEmail(email: string): Promise<IUser> {
		const users = await this.provider.read();
		const foundUser = users.find((u) => u.email === email);
		if (!foundUser) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `User does not exist`);
		}
		return foundUser;
	}

	public async getByResetToken(token: string) {
		const users = await this.provider.read();
		const foundUser = users.find((u) => u?.resetToken === token);
		if (!foundUser) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `User not found`);
		}
		return foundUser;
	}

	public async updateResetToken(email: string, token: string | null): Promise<IUser> {
		const user = await this.getByEmail(email);
		user.resetToken = token;
		return this.provider.updateById(user.id, user);
	}

	@validateDto
	public async update(id: string, @validDto(UpdateUserDto) userDto: UpdateUserDto) {
		if (!this.isUserExist(userDto.email)) {
			throw new HttpError(
				StatusCodeEnum.BAD_REQUEST,
				`Email adress [${userDto.email}] is allready in use`,
			);
		}
		const user = await this.getById(id);
		if (userDto.password) {
			userDto.password = await bcrypt.hash(userDto.password, SALT_ROUNDS);
		}
		merge(user, userDto);
		return this.provider.updateById(user.id, user);
	}

	public async delete(id: string) {
		const deletedUser = this.provider.deleteById(id);
		if (!deletedUser) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `User [${id}] not found`);
		}
		await this.deleteAssociatedPatients(id);
		return deletedUser;
	}

	private async deleteAssociatedPatients(id: string) {
		const patients = await this.patientsRepository.getAll();
		const patientsToDelete = patients.filter((p) => p.user.id === id);
		const promises = patientsToDelete.map((p) => this.patientsRepository.remove(p));
		await Promise.all(promises);
	}
}

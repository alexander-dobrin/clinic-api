import { inject, injectable } from 'inversify';
import { GetOptions } from '../common/types';
import { CONTAINER_TYPES } from '../common/constants';
import { HttpError } from '../common/errors';
import { ErrorMessageEnum, StatusCodeEnum } from '../common/enums';
import { merge } from 'lodash';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { validDto, validateDto } from '../common/decorator/validate-dto';
import { User } from './user';
import { DataSource, EntityNotFoundError, QueryFailedError, Repository } from 'typeorm';

@injectable()
export class UserService {
	private readonly userRepository: Repository<User>;

	constructor(@inject(CONTAINER_TYPES.DB_CONNECTION) private readonly dataSource: DataSource) {
		this.userRepository = dataSource.getRepository(User);
	}

	@validateDto
	public async create(@validDto(CreateUserDto) userDto: CreateUserDto): Promise<User> {
		const user = this.userRepository.create({
			email: userDto.email.toLowerCase(),
			role: userDto.role,
			firstName: userDto.firstName,
			password: userDto.password,
			activationLink: userDto.activationLink,
		});
		const savedUser = await this.userRepository.save(user);
		
	    return this.userRepository.findOneBy({ id: savedUser.id });
	}

	public async get(options: GetOptions): Promise<User[]> {
		try {
			return this.userRepository.find({
				where: options.filter,
				order: options.sort ?? { createdAt: 'DESC' },
			});
		} catch (err) {
			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				throw new HttpError(StatusCodeEnum.BAD_REQUEST, ErrorMessageEnum.UNKNOWN_QUERY_PARAMETER);
			}
			throw err;
		}
	}

	public async getById(id: string): Promise<User> {
		try {
			const user = await this.dataSource.manager
				.createQueryBuilder(User, 'user')
				.where('user.id = :id', { id })
				.addSelect(['user.createdAt', 'user.activationLink', 'user.password', 'user.resetToken'])
				.getOneOrFail();

			return user;
		} catch (err) {
			if (err instanceof EntityNotFoundError) {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `User [${id}] not found`);
			}

			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				throw new HttpError(StatusCodeEnum.NOT_FOUND, `User [${id}] not found`);
			}

			throw err;
		}
	}

	public async getByEmail(email: string): Promise<User> {
		const user = await this.dataSource.manager
			.createQueryBuilder(User, 'user')
			.where('user.email = :email', { email: email.toLowerCase() })
			.addSelect(['user.password', 'user.resetToken'])
			.getOne();

		if (!user) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `User does not exist`);
		}

		return user;
	}

	public async activate(link: string) {
		const user = await this.userRepository.findOneBy({ activationLink: link });

		if (!user) {
			throw new HttpError(StatusCodeEnum.BAD_REQUEST, `Invalid activation link`);
		}

		user.isActivated = true;
		await this.userRepository.save(user);
	}

	public async updateResetToken(email: string, token: string | null): Promise<User> {
		const user = await this.getByEmail(email);
		user.resetToken = token;

		return this.userRepository.save(user);
	}

	@validateDto
	public async update(id: string, @validDto(UpdateUserDto) userDto: UpdateUserDto): Promise<User> {
		const user = await this.getById(id);
		merge(user, userDto);
		await this.userRepository.save(user);

		return this.userRepository.findOneBy({ id });
	}

	public async setNewPassword(resetToken: string, password: string) {
		const user = await this.dataSource.manager
			.createQueryBuilder(User, 'user')
			.where('user.resetToken = :resetToken', { resetToken })
			.addSelect(['user.password, user.resetToken'])
			.getOne();

		if (!user) {
			throw new HttpError(StatusCodeEnum.NOT_FOUND, `User not found`);
		}

		user.resetToken = null;
		user.password = password;
		this.userRepository.save(user);
	}

	public async delete(id: string): Promise<void> {
		try {
			await this.userRepository.delete(id);
		} catch (err) {
			if (err instanceof QueryFailedError && err.driverError.file === 'uuid.c') {
				return;
			}
			throw err;
		}
	}
}

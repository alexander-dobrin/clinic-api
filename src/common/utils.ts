import { ErrorMessageEnum, StatusCodeEnum } from './enums';
import { HttpError } from './errors';
import { GetOptions } from './types';
import { Repository as BaseRepository, EntityPropertyNotFoundError } from 'typeorm';

export abstract class Repository {
	public static async findMatchingOptions<T>(
		repository: BaseRepository<T>,
		options: GetOptions,
	): Promise<T[]> {
		try {
			const entities = await repository.find({
				where: options.filter,
				order: options.sort ?? { createdAt: 'DESC' },
			});
			return entities;
		} catch (err) {
			if (err instanceof EntityPropertyNotFoundError) {
				throw new HttpError(StatusCodeEnum.BAD_REQUEST, ErrorMessageEnum.UNKNOWN_QUERY_PARAMETER);
			}
			throw err;
		}
	}
}

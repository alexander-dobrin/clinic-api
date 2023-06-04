import { ClassConstructor, plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { HttpError } from '../errors';
import { METADATA } from '../constants';
import { StatusCodeEnum } from '../enums';
import { ValidDtoParamInfo } from '../types';

export function validDto<T extends object>(dtoValidationClassConstructor: ClassConstructor<T>) {
	return function (target: any, propertyKey: string, parameterIndex: number) {
		const paramToValidateIndexes: ValidDtoParamInfo<T>[] = Reflect.getMetadata(
			METADATA.VALIDATE_DTO,
			target,
			propertyKey,
		);
		const paramInfo: ValidDtoParamInfo<T> = {
			index: parameterIndex,
			validationClassConstructor: dtoValidationClassConstructor,
		};
		if (paramToValidateIndexes) {
			paramToValidateIndexes.push(paramInfo);
		} else {
			Reflect.defineMetadata(METADATA.VALIDATE_DTO, [paramInfo], target, propertyKey);
		}
	};
}

export function validateDto<T extends object>(
	target: any,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) {
	const paramToValidateIndexes: ValidDtoParamInfo<T>[] = Reflect.getMetadata(
		METADATA.VALIDATE_DTO,
		target,
		propertyKey,
	);

	if (!paramToValidateIndexes) {
		return;
	}
	const originalMethod = descriptor.value;

	descriptor.value = async function (...params: any[]) {
		try {
			await Promise.all(
				paramToValidateIndexes.map(async ({ index, validationClassConstructor }) => {
					const paramToValidate = params[index];
					const dtoValidatorClassInstance = plainToClass(
						validationClassConstructor,
						paramToValidate,
					);
					await validateOrReject(dtoValidatorClassInstance, {
						whitelist: true,
						forbidNonWhitelisted: true,
					});
				}),
			);
			return await Reflect.apply(originalMethod, this, params);
		} catch (errors) {
			if (Array.isArray(errors)) {
				const message = errors
					.map((error) => Object.values(error.constraints).join('; '))
					.join('; ');
				throw new HttpError(StatusCodeEnum.UNPROCESSABLE_ENTITY, message);
			}
			throw errors;
		}
	};
}

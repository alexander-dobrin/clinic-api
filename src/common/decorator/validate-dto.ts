import { ClassConstructor, plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { HttpError } from '../errors';
import { METADATA } from '../constants';
import { StatusCodeEnum } from '../enums';
import { ValidDtoParamInfo } from '../types';

export function validDto<T extends object>(dtoValidationClassConstructor: ClassConstructor<T>) {
	return function (target: object, propertyKey: string, parameterIndex: number) {
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
	target: object,
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

	descriptor.value = async function (...params: object[]) {
		await Promise.all(
			paramToValidateIndexes.map(async ({ index, validationClassConstructor }) => {
				const paramToValidate = params[index];
				const dtoValidatorClassInstance = plainToClass(validationClassConstructor, paramToValidate);
				try {
					await validateOrReject(dtoValidatorClassInstance, {
						whitelist: true,
						forbidNonWhitelisted: true,
					});
				} catch (err) {
					let message = err.message;
					if (Array.isArray(err)) {
						message = err.map((error) => Object.values(error.constraints).join('; ')).join('; ');
					}
					throw new HttpError(StatusCodeEnum.UNPROCESSABLE_ENTITY, message);
				}
			}),
		);
		return await Reflect.apply(originalMethod, this, params);
	};
}

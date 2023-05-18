import { ClassConstructor, plainToClass } from "class-transformer";
import { validateOrReject } from "class-validator";
import { UnprocessableEntityError } from "./errors";
import { METADATA } from "./constants";

export interface ValidDtoParamInfo<T extends object> {
    index: number;
    validationClassConstructor: ClassConstructor<T>
}

export function validDto<T extends object>(dtoValidationClassConstructor: ClassConstructor<T>) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        const paramToValidateIndexes: ValidDtoParamInfo<T>[] = Reflect.getMetadata(METADATA.VALIDATE_DTO, target, propertyKey);
        const paramInfo: ValidDtoParamInfo<T> = {
            index: parameterIndex,
            validationClassConstructor: dtoValidationClassConstructor
        }
        if (paramToValidateIndexes) {
            paramToValidateIndexes.push(paramInfo);
        } else {
            Reflect.defineMetadata(METADATA.VALIDATE_DTO, [paramInfo], target, propertyKey);
        }
    }   
}

export function validateDto<T extends object>(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const paramToValidateIndexes: ValidDtoParamInfo<T>[] = Reflect.getMetadata(METADATA.VALIDATE_DTO, target, propertyKey);

    if (!paramToValidateIndexes) {
        return;
    }
    const originalMethod = descriptor.value;

    descriptor.value = async function (...params: any[]) {
        try {
            await Promise.all(paramToValidateIndexes.map(async ({ index, validationClassConstructor }) => {
                const paramToValidate = params[index];
                const dtoValidatorClassInstance = plainToClass(validationClassConstructor, paramToValidate);
                await validateOrReject(dtoValidatorClassInstance);
            }));
            await Reflect.apply(originalMethod, this, params);
        } catch (errors) {
            if (Array.isArray(errors)) {
                const message = errors.map((error) => Object.values(error.constraints).join('; '));
                throw new UnprocessableEntityError(message);
            }
            throw errors;
        }
    }
}
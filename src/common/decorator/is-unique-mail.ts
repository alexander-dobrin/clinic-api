import {
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	registerDecorator,
} from 'class-validator';
import { iocContainer } from '../config/inversify.config';
import { UserRepository } from '../../user/user-repository';
import { CONTAINER_TYPES } from '../constants';

@ValidatorConstraint()
class IsUniqueMailConstraint implements ValidatorConstraintInterface {
	async validate(email: string): Promise<boolean> {
		if (!email) {
			return false;
		}
		const userRepository = iocContainer.get<UserRepository>(CONTAINER_TYPES.USER_REPOSITORY);
		const user = await userRepository.findOneBy({ email: email.toLowerCase() });
		return user === null;
	}

	defaultMessage(validationArguments?: ValidationArguments): string {
		throw new Error(`Email adress [${validationArguments.value}] is allready in use`);
	}
}

export function IsUniqueMail(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: IsUniqueMailConstraint,
		});
	};
}
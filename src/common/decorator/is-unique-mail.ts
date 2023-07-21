import {
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	registerDecorator,
} from 'class-validator';
import { iocContainer } from '../config/inversify.config';
import { CONTAINER_TYPES } from '../constants';
import { DataSource } from 'typeorm';
import { User } from '../../user/user';

@ValidatorConstraint()
class IsUniqueMailConstraint implements ValidatorConstraintInterface {
	async validate(email: string): Promise<boolean> {
		if (!email) {
			return false;
		}
		const userRepository = iocContainer
			.get<DataSource>(CONTAINER_TYPES.DB_CONNECTION)
			.getRepository(User);
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

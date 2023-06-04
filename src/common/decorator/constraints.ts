import {
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	registerDecorator,
} from 'class-validator';
import { DateTime } from 'luxon';

@ValidatorConstraint()
class IsNotInThePastConstraint implements ValidatorConstraintInterface {
	validate(utcDate: string) {
		const currentDate = DateTime.utc();
		const inputDate = DateTime.fromISO(utcDate, { zone: 'utc' });
		return inputDate > currentDate;
	}

	defaultMessage(): string {
		return '$property date can not be in the past';
	}
}

export function IsNotInThePast(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: IsNotInThePastConstraint,
		});
	};
}

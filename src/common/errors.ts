import { StatusCodeEnum } from "./enums";

export class AppointmentConflictError extends Error {
	constructor(message) {
		super(message);
		Error.captureStackTrace(this, AppointmentConflictError);
	}
}

export class DuplicateEntityError extends Error {
	constructor(message) {
		super(message);
		Error.captureStackTrace(this, DuplicateEntityError);
	}
}

export class InvalidParameterError extends Error {
	constructor(message) {
		super(message);
		Error.captureStackTrace(this, InvalidParameterError);
	}
}

export class UnableToSortError extends Error {
	constructor(message) {
		super(message);
		Error.captureStackTrace(this, InvalidParameterError);
	}
}

export class UnableToFilterError extends Error {
	constructor(message) {
		super(message);
		Error.captureStackTrace(this, InvalidParameterError);
	}
}

export class NotAuthorizedError extends Error {
	constructor(message) {
		super(message);
		Error.captureStackTrace(this, InvalidParameterError);
	}
}

export class UserConfilctError extends Error {
	constructor(message) {
		super(message);
		Error.captureStackTrace(this, InvalidParameterError);
	}
}

export class UnprocessableEntityError extends Error {
	constructor(message) {
		super(message);
		Error.captureStackTrace(this, InvalidParameterError);
	}
}

export class HttpError extends Error {
	constructor(public code: StatusCodeEnum, message: string) {
		super(message);
		Error.captureStackTrace(this, HttpError);
	}
}
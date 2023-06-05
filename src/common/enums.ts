export enum StatusCodeEnum {
	CREATED = 201,
	NO_CONTENT = 204,
	BAD_REQUEST = 400,
	NOT_FOUND = 404,
	INTERNAL_SERVER_ERROR = 500,
	CONFLICT = 409,
	UNPROCESSABLE_ENTITY = 422,
	NOT_AUTHORIZED = 401,
}

export enum ErrorMessageEnum {
	UNKNOWN_QUERY_PARAMETER = 'Unknown query parameters',
	INCORRECT_PASSWORD = 'Incorrect password',
	INVALID_RESET_TOKEN = 'Invalid reset token',
	NOT_AUTHORIZED = 'Authorization required',
}

export enum TokenLifetimeEnum {
	RESET_TOKEN = '15m',
	REGISTER_TOKEN = '1d',
	LOGIN_TOKEN = '1d',
}

export enum RequestMethodEnum {
	GET = 'GET',
}

export enum UserRoleEnum {
	GUEST = 'guest',
	USER = 'user',
	DOCTOR = 'doctor',
	PATIENT = 'patient',
}

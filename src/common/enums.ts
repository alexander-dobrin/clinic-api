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
	INVALID_RESET_TOKEN = 'Invalid reset token',
	NOT_AUTHORIZED = 'Authorization required',
	VERSION_MISMATCH = 'Entity versions mismatch',
}

export enum TokenLifetimeEnum {
	RESET_TOKEN = '15m',
	REGISTER_TOKEN = '1d',
	LOGIN_TOKEN = '1d',
	ACCESS_TOKEN = '1d',
	REFRESH_TOKEN = '30d',
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

export enum CookieLifetimeEnum {
	ONE_MONTH = 30 * 24 * 60 * 60 * 1000,
}

export enum CookieTypesEnum {
	REFRESH_TOKEN = 'refreshToken',
}

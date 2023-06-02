export const CONTAINER_TYPES = {
	PATIENTS_ROUTES: Symbol.for('PATIENTS_ROUTES'),
	PATIENTS_CONTROLLER: Symbol.for('PATIENTS_CONTROLLER'),
	PATIENTS_SERVICE: Symbol.for('PATIENTS_SERVICE'),
	PATIENTS_REPOSITORY: Symbol.for('PATIENTS_REPOSITORY'),

	DOCTORS_ROUTES: Symbol.for('DOCTORS_ROUTES'),
	DOCTORS_CONTROLLER: Symbol.for('DOCTORS_CONTROLLER'),
	DOCTORS_SERVICE: Symbol.for('DOCTORS_SERVICE'),
	DOCTORS_REPOSITORY: Symbol.for('DOCTORS_REPOSITORY'),

	APPOINTMENTS_ROUTES: Symbol.for('APPOINTMENTS_ROUTES'),
	APPOINTMENTS_CONTROLLER: Symbol.for('APPOINTMENTS_CONTROLLER'),
	APPOINTMENTS_SERVICE: Symbol.for('APPOINTMENTS_SERVICE'),
	APPOINTMENTS_REPOSITORY: Symbol.for('APPOINTMENTS_REPOSITORY'),

	AUTH_ROUTES: Symbol.for('AUTH_ROUTES'),
	AUTH_CONTROLLER: Symbol.for('AUTH_CONTROLLER'),
	AUTH_SERVICE: Symbol.for('AUTH_SERVICE'),
	AUTH_MIDDLEWARE: Symbol.for('AUTH_MIDDLEWARE'),

	USER_SERVICE: Symbol.for('USER_SERVICE'),
	USER_CONTROLLER: Symbol.for('USER_CONTROLLER'),
	USER_ROUTES: Symbol.for('USER_ROUTES'),
	USER_REPOSITORY: Symbol.for('USER_REPOSITORY'),

	APP: Symbol.for('APP'),
	EXCEPTION_FILTER: Symbol.for('EXCEPTION_FILTER'),

	APPOINTMENTS_DATA_PROVIDER: Symbol.for('APPOINTMENTS_DATA_PROVIDER'),
	DOCTORS_DATA_PROVIDER: Symbol.for('DOCTORS_DATA_PROVIDER'),
	USER_DATA_PROVIDER: Symbol.for('USER_DATA_PROVIDER'),
	DB_CONNECTION: Symbol.for('DB_CONNECTION'),
} as const;

export const METADATA = {
	VALIDATE_DTO: 'VALIDATE_DTO',
} as const;

export const SALT_ROUNDS = 8;

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
    PHONE_IS_TAKEN = 'Phone [%s] is allready taken',
    UNKNOWN_ID = 'Entity [%s] does not exist',
    DOCTOR_NOT_AVAILABLE = 'Doctor [%s] is not available at [%s]',
    UNABLE_TO_SORT = 'Sorting based on [%s] data can not be processed since currently such data is empty',
    UNKNOWN_QUERY_PARAMETER = 'Unknown query parameter [%s]',
    INVALID_FILTER_PARAMETER = `Query filterBy parameter [%s] must follow field:value format`,
    USER_ALLREADY_EXISTS = 'User [%s] allready exists',
    INVALID_PASSWORD = 'Password is not correct',
    USER_NOT_FOUND = 'User [%s] not found',
    INVALID_RESET_TOKEN = 'Invalid reset token',
    NOT_AUTHORIZED = 'Authorization requiered'
}

export enum ResponseMessageEnum {
    PASSWORD_RECOVERED = 'Password has been successfully recovered'
}

export enum TokenLifetimeEnum {
    RESET_TOKEN = '15m',
    REGISTER_TOKEN = '1d',
    LOGIN_TOKEN = '1d'
}

export enum RequestMethodEnum {
    GET = 'GET',
}

export enum EventEnum {
    DOCTOR_DELETED = 'doctorDeleted'
}

export enum DoctorsSortByEnum {
    APPOINTMENTS = 'appointments',
    NAME = 'name',
}

export enum SortOrderEnum {
    ACSENDING = 'asc',
    DESCENDING = 'desc'
}

export enum AppointmentsFilterByEnum {
    DOCTORS = 'doctorid',
    PATIENTS = 'patientid'
}

export enum PatietnsFilterByEnum {
    NAME = 'name',
    PHONE = 'phonenumber'
}

export enum UserRoleEnum {
    GUEST = 'guest',
    USER = 'user',
    DOCTOR = 'doctor'
}
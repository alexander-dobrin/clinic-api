export enum StatusCodeEnum {
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422
}

export enum ErrorMessageEnum {
    PHONE_IS_TAKEN = 'Phone [%s] is allready taken',
    UNKNOWN_ID = 'Entity [%s] does not exist',
    DOCTOR_NOT_AVAILABLE = 'Doctor [%s] is not available at [%s]'
}

export enum RequestMethodEnum {
    GET = 'GET',
}

export enum EventEnum {
    DOCTOR_DELETED = 'doctorDeleted'
}
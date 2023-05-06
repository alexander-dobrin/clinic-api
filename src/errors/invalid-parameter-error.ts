export class InvalidParameterError extends Error {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, InvalidParameterError);
    }
}
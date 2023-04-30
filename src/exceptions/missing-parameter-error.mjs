export class MissingParameterError extends Error {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, MissingParameterError);
    }
}
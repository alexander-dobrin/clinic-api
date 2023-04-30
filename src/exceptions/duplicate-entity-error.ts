export class DuplicateEntityError extends Error {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, DuplicateEntityError);
    }
}
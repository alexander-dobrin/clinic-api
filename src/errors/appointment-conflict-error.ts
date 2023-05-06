export class AppointmentConflictError extends Error {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, AppointmentConflictError);
    }
}
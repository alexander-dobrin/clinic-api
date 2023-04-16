export class AppointmentCreationException extends Error {
    constructor(message) {
      super(message);
      this.name = 'AppointmentCreationException';
      this.statusCode = 400;
      this.stack = new Error().stack;
    }
}
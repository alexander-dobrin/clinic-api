import { STATUS_CODES } from '../enums.mjs';

export class PatientCreationException extends Error {
    constructor(message) {
      super(message);
      this.name = this.constructor.name;
      this.statusCode = STATUS_CODES.BAD_REQUEST;
      this.stack = new Error().stack;
    }
}
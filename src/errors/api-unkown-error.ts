import { ApiHttpError } from "./api-http-error";

export class ApiUnkownError extends ApiHttpError {
  /**
   * Thrown whenever the Http status code is between 201 and 399.
   *
   * @param {string} message Api Unknown Error details
   */
  constructor(message: string) {
    super(message);
  }
}

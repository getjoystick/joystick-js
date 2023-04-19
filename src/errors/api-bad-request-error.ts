import { ApiHttpError } from "./api-http-error";

export class ApiBadRequestError extends ApiHttpError {
  /**
   * Thrown whenever the Http status code is between 400 and 499.
   *
   * @param {string} message Bad request details
   */
  constructor(message: string) {
    super(message);
  }
}

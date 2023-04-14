import { ApiHttpError } from "./api-http-error";

export class ApiServerError extends ApiHttpError {
  /**
   * Thrown whenever the Http status code is equal or greater than 500.
   *
   * @param {string} message Api Server Error details
   */
  constructor(message: string) {
    super(message);
  }
}

import { ApiError } from "./api-error";

export class MultipleContentsApiError extends ApiError {
  /**
   * Thrown whenever the Http status code is 200, but there is at least one error in the response.
   *
   * @param {string} message Composed error message, representing all the errors presented on the response
   */
  constructor(message: string) {
    super(message);
  }
}

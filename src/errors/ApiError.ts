import { ApiResponse, ApiResponseError } from "../models/api-response";

export class ApiError extends Error {
  private readonly _errors: Record<string, any>;

  constructor({ errors, title }: ApiResponseError) {
    super(`${title}\n${JSON.stringify(errors)}`);

    this._errors = errors;
  }

  get errors(): Record<string, any> {
    return this._errors;
  }

  static isApiResponseError(
    response: ApiResponse | ApiResponseError
  ): response is ApiResponseError {
    return (response as ApiResponseError).errors !== undefined;
  }
}

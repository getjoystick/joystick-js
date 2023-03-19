import { ApiResponse, ApiResponseError } from "../models/api-response";
import { Payload } from "../models/payload";
import { ApiError } from "../errors/ApiError";
import { ILogger } from "../internals/logger/i-logger";
import { IApiClient } from "./i-api-client";
import { IHttpClient } from "../internals/client/i-http-client";

/**
 * API Client to getContents, using REST protocol
 */
export class ApiClient implements IApiClient {
  constructor(private client: IHttpClient, private logger: ILogger) {}

  /**
   * Gets the contents from Joystick API.
   *
   * The data is requested with dynamic=true&responseType=serialized to guarantee a raw format on cache
   *
   * All the transformations occur after retrieve the data from the cache.
   *
   */
  async getDynamicContent(
    contentIds: string[],
    payload: Payload
  ): Promise<Record<string, ApiResponse>> {
    const response: Record<string, ApiResponse | ApiResponseError> =
      await this.client.post(
        `/combine/`,
        {
          u: payload.userId ?? "",
          v: payload.semVer,
          p: payload.params,
        },
        {
          c: JSON.stringify(contentIds),
          dynamic: "true",
          responseType: "serialized",
        }
      );

    return Object.entries(response).reduce((acc, [key, value]) => {
      this.logger.debug({ value });

      if (ApiError.isApiResponseError(value)) {
        throw new ApiError(value);
      }

      return { ...acc, [key]: value };
    }, {});
  }
}

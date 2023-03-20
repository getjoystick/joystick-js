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

  async getDynamicContent(
    contentIds: string[],
    payload: Payload
  ): Promise<Record<string, ApiResponse>> {
    const { params, semVer, userId } = payload;

    const response: Record<string, ApiResponse | ApiResponseError> =
      await this.client.post(
        `/combine/`,
        {
          u: userId ?? "",
          v: semVer,
          p: params,
        },
        {
          c: JSON.stringify(contentIds),
          dynamic: "true",
          responseType: "serialized",
        }
      );

    return Object.entries(response).reduce((acc, [key, value]) => {
      if (ApiError.isApiResponseError(value)) {
        this.logger.error(value);

        throw new ApiError(value);
      }

      return { ...acc, [key]: value };
    }, {});
  }
}

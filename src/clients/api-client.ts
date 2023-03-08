import { HttpClient } from "../internals/client/http-client";
import { ApiResponse, ApiResponseError } from "../models/api-response";
import { Payload } from "../models/payload";
import { ApiError } from "../errors/ApiError";

/**
 * API Client to getContents, using REST protocol
 */
export class ApiClient {
  private readonly _client: HttpClient;

  constructor(client: HttpClient) {
    this._client = client;
  }

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
      await this._client.post(
        `/combine/`,
        {
          u: payload.userId ?? "",
          v: payload.semVer,
          p: payload.params,
        },
        {
          c: `[${contentIds.map((contentId) => `"${contentId}"`).join(",")}]`,
          dynamic: true,
          responseType: "serialized",
        }
      );

    return Object.entries(response).reduce((acc, [key, value]) => {
      if (ApiError.isApiResponseError(value)) {
        throw new ApiError(value);
      }

      return { ...acc, [key]: value };
    }, {});
  }
}

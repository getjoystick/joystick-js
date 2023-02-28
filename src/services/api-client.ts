import { HttpClient } from "../internals/client/http-client";
import { ApiResponse } from "../models/api-response";

export interface Payload {
  userId?: string;
  semVer?: string;
  params?: Record<string, any>;
}

/**
 * API Client to getContent, using REST protocol
 */
export class ApiClient {
  private readonly _client: HttpClient;

  constructor(apiKey: string) {
    this._client = new HttpClient(apiKey);
  }

  async getContent(
    contentId: string,
    payload: Payload,
    responseType?: "serialized"
  ): Promise<ApiResponse> {
    return await this._client.post(
      `/config/${contentId}/dynamic`,
      {
        u: payload.userId ?? "",
        v: payload.semVer,
        p: payload.params,
      },
      { responseType }
    );
  }

  async getContents(
    contentIds: string[],
    payload: Payload,
    options?: {
      responseType?: "serialized";
      dynamic: true;
    }
  ): Promise<Record<string, ApiResponse>> {
    return await this._client.post(
      `/combine`,
      {
        u: payload.userId ?? "",
        v: payload.semVer,
        p: payload.params,
      },
      {
        c: contentIds,
        dynamic: options?.dynamic,
        responseType: options?.responseType,
      }
    );
  }
}

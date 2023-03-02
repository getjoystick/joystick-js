import { HttpClient } from "../internals/client/http-client";
import { ApiResponse } from "../models/api-response";

export interface Payload {
  userId?: string;
  semVer?: string;
  params?: Record<string, any>;
}

/**
 * API Client to getContents, using REST protocol
 */
export class ApiClient {
  private readonly _client: HttpClient;

  constructor(client: HttpClient) {
    this._client = client;
  }

  async getDynamicContent(
    contentIds: string[],
    payload: Payload
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
        dynamic: true,
        responseType: "serialized",
      }
    );
  }
}

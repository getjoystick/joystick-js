import { Client } from "../clients/client";

export interface Payload {
  userId?: string;
  semVer?: string;
  params?: Record<string, any>;
}

export class ApiClient {
  private _client: Client;

  constructor(client: Client) {
    this._client = client;
  }

  async getContent(
    contentId: string,
    payload: Payload,
    responseType?: "serialized"
  ) {
    return await this._client.post(
      `/config/${contentId}/dynamic`,
      {
        u: payload.userId,
        v: payload.semVer,
        p: payload.params,
      },
      { responseType }
    );
  }
}

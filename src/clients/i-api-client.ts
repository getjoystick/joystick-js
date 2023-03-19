import { Payload } from "../models/payload";
import { ApiResponse } from "../models/api-response";

export interface IApiClient {
  getDynamicContent(
    contentIds: string[],
    payload: Payload
  ): Promise<Record<string, ApiResponse>>;
}

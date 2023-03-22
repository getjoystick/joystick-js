import { GetDynamicContentPayload } from "../models/get-dynamic-content-payload";
import { ApiResponse } from "../models/api-response";
import { PublishContentUpdatePayload } from "../models/publish-content-update-payload";

export interface ApiClient {
  getDynamicContent({
    contentIds,
    payload,
    responseType,
  }: {
    contentIds: string[];
    payload: GetDynamicContentPayload;
    responseType?: "serialized";
  }): Promise<Record<string, ApiResponse>>;

  publishContentUpdate({
    contentId,
    payload,
  }: {
    contentId: string;
    payload: PublishContentUpdatePayload;
  }): Promise<void>;
}

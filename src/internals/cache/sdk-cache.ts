import { ApiResponse } from "../../models/api-response";

export interface SdkCache {
  clear(): Promise<void>;

  get(key: string): Promise<Record<string, ApiResponse> | undefined>;

  set(key: string, value: Record<string, ApiResponse>): Promise<void>;

  setCacheExpirationSeconds(cacheExpirationSeconds: number): Promise<void>;
}

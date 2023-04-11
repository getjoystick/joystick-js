import { ApiResponse } from "../../models/api-response";

export interface SdkCache {
  clear(): Promise<void>;

  set(key: string, value: Record<string, ApiResponse>): Promise<void>;

  get(key: string): Promise<Record<string, ApiResponse> | undefined>;

  setCacheExpirationSeconds(cacheExpirationSeconds: number): Promise<void>;
}

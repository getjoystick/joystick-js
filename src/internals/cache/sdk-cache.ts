import { ApiResponse } from "../../models/api-response";

export interface SdkCache {
  /**
   * Clear the cache
   */
  clear(): Promise<void>;

  /**
   * Get the cache by @param key
   */
  get(key: string): Promise<Record<string, ApiResponse> | undefined>;

  set(key: string, value: Record<string, ApiResponse>): Promise<void>;

  setCacheExpirationSeconds(cacheExpirationSeconds: number): void;
}

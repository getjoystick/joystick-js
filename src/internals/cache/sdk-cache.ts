import { ApiResponse } from "../../models/api-response";

export interface SdkCache {
  clear(): void;

  set(key: string, value: Record<string, ApiResponse>): void;

  get(key: string): Promise<Record<string, ApiResponse> | undefined>;

  setCacheExpirationInSeconds(cacheExpirationInSeconds: number): void;
}

import { SdkCache } from "../../../../src/internals/cache/sdk-cache";
import NodeCache from "node-cache";
import { ApiResponse } from "../../../../src/models/api-response";

export class NodeCacheImpl implements SdkCache {
  private readonly cache: NodeCache;
  private readonly keys: Set<string>; // maintain the keys managed by this cache

  constructor(cacheExpirationInSeconds: number) {
    this.cache = new NodeCache({
      maxKeys: 1_000,
      stdTTL: cacheExpirationInSeconds,
    });

    this.keys = new Set<string>();
  }

  clear(): void {
    this.cache.del([...this.keys]); // remove only the keys maintained by this cache

    this.keys.clear();
  }

  set(key: string, value: Record<string, ApiResponse>): void {
    this.cache.set(key, value);

    this.keys.add(key);
  }

  get(key: string): Promise<Record<string, ApiResponse> | undefined> {
    return Promise.resolve(this.cache.get(key));
  }

  setCacheExpirationInSeconds(cacheExpirationInSeconds: number): void {
    this.cache.options.stdTTL = cacheExpirationInSeconds;
  }
}

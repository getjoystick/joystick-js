import NodeCache from "node-cache";
import { SdkCache } from "../../../../src/internals/cache/sdk-cache";
import { ApiResponse } from "../../../../src/models/api-response";

export class NodeCacheImpl implements SdkCache {
  private readonly cache: NodeCache;
  private readonly keys: Set<string>; // maintain the keys managed by this cache

  constructor(cacheExpirationSeconds: number) {
    this.cache = new NodeCache({
      maxKeys: 1_000,
      stdTTL: cacheExpirationSeconds,
    });

    this.keys = new Set<string>();
  }

  clear(): Promise<void> {
    this.cache.del([...this.keys]); // remove only the keys maintained by this cache

    this.keys.clear();

    return Promise.resolve();
  }

  set(key: string, value: Record<string, ApiResponse>): Promise<void> {
    this.cache.set(key, value);

    this.keys.add(key);

    return Promise.resolve();
  }

  get(key: string): Promise<Record<string, ApiResponse> | undefined> {
    return Promise.resolve(this.cache.get(key));
  }

  setCacheExpirationSeconds(cacheExpirationSeconds: number): void {
    this.cache.options.stdTTL = cacheExpirationSeconds;
  }
}

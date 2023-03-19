import { ICache } from "./i-cache";

interface Value<ValueType> {
  data: ValueType;
  cached_at_timestap_in_ms: number;
  last_accessed_at_timestap_in_ms: number;
}

/**
 * A class used to cache values in memory.
 * @overview A simple implementation to avoid dependencies
 */
export class InMemoryCache<ValueType> implements ICache<ValueType> {
  private readonly cache: Map<string, Value<ValueType>>;
  private cacheExpirationInSeconds: number;
  private readonly maxItemsInCache: number;
  private readonly nowFn: () => number;

  /**
   * @param cacheExpirationInSeconds
   * @param maxItemsInCache The max number of items in cache. Should be positive.
   * @param nowFn now function. Used for testing or custom implementation.
   */
  constructor(
    cacheExpirationInSeconds: number,
    maxItemsInCache: number = 1_000,
    nowFn: () => number = Date.now
  ) {
    this.validateCacheExpirationInSeconds(cacheExpirationInSeconds);
    this.validateMaxItemsInCache(maxItemsInCache);

    this.cacheExpirationInSeconds = cacheExpirationInSeconds;
    this.maxItemsInCache = maxItemsInCache;
    this.nowFn = nowFn;

    this.cache = new Map<string, Value<ValueType>>();
  }

  setCacheExpirationInSeconds(cacheExpirationInSeconds: number) {
    this.validateCacheExpirationInSeconds(cacheExpirationInSeconds);

    this.cacheExpirationInSeconds = cacheExpirationInSeconds;
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  set(key: string, value: ValueType): void {
    this.cache.set(key, {
      data: value,
      cached_at_timestap_in_ms: this.nowFn(),
      last_accessed_at_timestap_in_ms: this.nowFn(),
    });

    this.checkLruMaxSize();
  }

  get(key: string): Promise<ValueType | undefined> {
    const result = this.cache.get(key);

    if (
      !result ||
      result.cached_at_timestap_in_ms + this.cacheExpirationInSeconds * 1_000 <
        this.nowFn()
    ) {
      return Promise.resolve(undefined);
    }

    result.last_accessed_at_timestap_in_ms = this.nowFn();

    return Promise.resolve(result.data);
  }

  clear(): void {
    this.cache.clear();
  }

  private checkLruMaxSize() {
    if (this.cache.size <= this.maxItemsInCache) return;

    const keysToDelete = [...this.cache.entries()]
      .sort(
        ([, left], [, right]) =>
          right.last_accessed_at_timestap_in_ms -
          left.last_accessed_at_timestap_in_ms
      )
      .slice(this.maxItemsInCache)
      .map(([key]) => key);

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  private validateCacheExpirationInSeconds(cacheExpirationInSeconds: number) {
    if (cacheExpirationInSeconds <= 0) {
      throw new Error(
        "cacheExpirationInSeconds should be greater than 0. Got " +
          cacheExpirationInSeconds
      );
    }
  }

  private validateMaxItemsInCache(maxItemsInCache: number) {
    if (maxItemsInCache < 1) {
      throw new Error(
        "maxItemsInCache should be greater than 0. Got " + maxItemsInCache
      );
    }
  }
}

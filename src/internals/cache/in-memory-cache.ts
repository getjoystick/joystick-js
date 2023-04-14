import { SdkCache } from "./sdk-cache";
import { Logger } from "../logger/logger";
import { ApiResponse } from "../../models/api-response";
import { InvalidArgumentError } from "../../errors/invalid-argument-error";

interface CacheValue {
  value: Record<string, ApiResponse>;
  cachedAtTimestampMs: number;
  lastAccessedAtTimestampMs: number;
}

/**
 * In-memory implementation, using the Map class.
 */
export class InMemoryCache implements SdkCache {
  private readonly cache: Map<string, CacheValue>;
  private cacheExpirationMs: number;
  private readonly logger: Logger;
  private readonly maxItemsInCache: number;
  private readonly nowFn: () => number;

  /**
   * Initializes the InMemory cache.
   *
   *
   * @param {number} cacheExpirationSeconds Number of seconds while the cache item is valid.
   * @param {Logger} logger Logger implementation
   * @param {number} [maxItemsInCache = 1_000] Max number of items on cache, following the LRU algorithm
   * @param {() => number} [nowFn = Date.now] Time implementation to get now
   *
   */
  constructor(
    cacheExpirationSeconds: number,
    logger: Logger,
    maxItemsInCache: number = 1_000,
    nowFn: () => number = Date.now
  ) {
    this.validateCacheExpirationSeconds(cacheExpirationSeconds);
    this.validateMaxItemsInCache(maxItemsInCache);

    this.cacheExpirationMs = cacheExpirationSeconds * 1_000;
    this.logger = logger;
    this.maxItemsInCache = maxItemsInCache;
    this.nowFn = nowFn;

    this.cache = new Map<string, CacheValue>();
  }

  setCacheExpirationSeconds(cacheExpirationSeconds: number): void {
    this.validateCacheExpirationSeconds(cacheExpirationSeconds);

    this.cacheExpirationMs = cacheExpirationSeconds * 1_000;
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  set(key: string, value: Record<string, ApiResponse>): Promise<void> {
    this.cache.set(key, {
      value,
      cachedAtTimestampMs: this.nowFn(),
      lastAccessedAtTimestampMs: this.nowFn(),
    });

    this.checkLruMaxSize();

    return Promise.resolve();
  }

  get(key: string): Promise<Record<string, ApiResponse> | undefined> {
    const result = this.cache.get(key);

    if (!result || this.isExpired(result)) {
      return Promise.resolve(undefined);
    }

    result.lastAccessedAtTimestampMs = this.nowFn();

    return Promise.resolve(result.value);
  }

  private isExpired({ cachedAtTimestampMs }: CacheValue) {
    return cachedAtTimestampMs + this.cacheExpirationMs < this.nowFn();
  }

  async clear(): Promise<void> {
    await this.cache.clear();
  }

  private checkLruMaxSize() {
    if (this.cache.size <= this.maxItemsInCache) {
      return;
    }

    const keysToDelete = [...this.cache.entries()]
      .sort(
        ([, leftValue], [, rightValue]) =>
          rightValue.lastAccessedAtTimestampMs -
          leftValue.lastAccessedAtTimestampMs
      )
      .slice(this.maxItemsInCache)
      .map(([key]) => key);

    this.logger.debug({ keysToDelete }, "checkLruMaxSize");

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  private validateCacheExpirationSeconds(cacheExpirationSeconds: number) {
    if (cacheExpirationSeconds < 0) {
      throw new InvalidArgumentError(
        `Invalid cacheExpirationSeconds: <${cacheExpirationSeconds}>. It should be equal or greater than 0`
      );
    }
  }

  private validateMaxItemsInCache(maxItemsInCache: number) {
    if (maxItemsInCache < 1) {
      throw new InvalidArgumentError(
        `Invalid maxItemsInCache: <${maxItemsInCache}>. It should be greater than 0`
      );
    }
  }
}

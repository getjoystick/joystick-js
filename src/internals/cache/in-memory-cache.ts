import { SdkCache } from "./sdk-cache";
import { Logger } from "../logger/logger";
import { ApiResponse } from "../../models/api-response";
import { InvalidArgumentError } from "../../errors/invalid-argument-error";

interface CacheValue {
  value: Record<string, ApiResponse>;
  cachedAtTimestampInMs: number;
  lastAccessedAtTimestampInMs: number;
}

/**
 * In-memory implementation, using the Map class.
 */
export class InMemoryCache implements SdkCache {
  private readonly cache: Map<string, CacheValue>;
  private cacheExpirationInMs: number;
  private readonly logger: Logger;
  private readonly maxItemsInCache: number;
  private readonly nowFn: () => number;

  constructor({
    cacheExpirationInSeconds,
    logger,
    maxItemsInCache = 1_000,
    nowFn = Date.now,
  }: {
    cacheExpirationInSeconds: number;
    logger: Logger;
    maxItemsInCache?: number;
    nowFn?: () => number;
  }) {
    this.validateCacheExpirationInSeconds(cacheExpirationInSeconds);
    this.validateMaxItemsInCache(maxItemsInCache);

    this.cacheExpirationInMs = cacheExpirationInSeconds * 1_000;
    this.logger = logger;
    this.maxItemsInCache = maxItemsInCache;
    this.nowFn = nowFn;

    this.cache = new Map<string, CacheValue>();
  }

  setCacheExpirationInSeconds(cacheExpirationInSeconds: number) {
    this.validateCacheExpirationInSeconds(cacheExpirationInSeconds);

    this.cacheExpirationInMs = cacheExpirationInSeconds * 1_000;
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  set(key: string, value: Record<string, ApiResponse>): void {
    this.cache.set(key, {
      value,
      cachedAtTimestampInMs: this.nowFn(),
      lastAccessedAtTimestampInMs: this.nowFn(),
    });

    this.checkLruMaxSize();
  }

  get(key: string): Promise<Record<string, ApiResponse> | undefined> {
    const result = this.cache.get(key);

    if (!result || this.isExpired(result)) {
      return Promise.resolve(undefined);
    }

    result.lastAccessedAtTimestampInMs = this.nowFn();

    return Promise.resolve(result.value);
  }

  private isExpired({ cachedAtTimestampInMs }: CacheValue) {
    return cachedAtTimestampInMs + this.cacheExpirationInMs < this.nowFn();
  }

  clear(): void {
    this.cache.clear();
  }

  private checkLruMaxSize() {
    if (this.cache.size <= this.maxItemsInCache) return;

    const keysToDelete = [...this.cache.entries()]
      .sort(
        ([, leftValue], [, rightValue]) =>
          rightValue.lastAccessedAtTimestampInMs -
          leftValue.lastAccessedAtTimestampInMs
      )
      .slice(this.maxItemsInCache)
      .map(([key]) => key);

    this.logger.debug({ keysToDelete }, "checkLruMaxSize");

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  private validateCacheExpirationInSeconds(cacheExpirationInSeconds: number) {
    if (cacheExpirationInSeconds < 0) {
      throw new InvalidArgumentError(
        `Invalid cacheExpirationInSeconds: ${cacheExpirationInSeconds}. It should be equal or greater than 0.`
      );
    }
  }

  private validateMaxItemsInCache(maxItemsInCache: number) {
    if (maxItemsInCache < 1) {
      throw new InvalidArgumentError(
        `Invalid maxItemsInCache: ${maxItemsInCache}. It should be greater than 0.`
      );
    }
  }
}

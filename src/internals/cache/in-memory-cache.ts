interface Value<T> {
  data: T;
  cached_at_timestap_in_ms: number;
}

/**
 * A class used to cache values in memory.
 * @overview A simple implementation to avoid dependencies
 */
export class InMemoryCache<ValueType> {
  private _cache: Map<string, Value<ValueType>> = new Map<
    string,
    Value<ValueType>
  >();
  private readonly _cacheExpirationInSeconds: number;
  private readonly _nowFn: () => number;

  /**
   * @param cacheExpirationInSeconds The number of seconds that the cache should be kept.
   * @param nowFn
   */
  constructor(
    cacheExpirationInSeconds: number,
    nowFn: () => number = Date.now
  ) {
    this._cacheExpirationInSeconds = cacheExpirationInSeconds;
    this._nowFn = nowFn;
  }

  set(key: string, value: ValueType) {
    this._cache.set(key, {
      data: value,
      cached_at_timestap_in_ms: this._nowFn(),
    });
  }

  get(key: string): ValueType | undefined {
    const result = this._cache.get(key);

    if (
      !result ||
      result.cached_at_timestap_in_ms + this._cacheExpirationInSeconds * 1_000 <
        this._nowFn()
    ) {
      return undefined;
    }

    return result.data;
  }
}

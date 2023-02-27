interface Value<T> {
  data: T;
  cached_at_timestap: number;
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
  private readonly _cacheLengthInMinutes: number;
  private readonly _nowFn: () => number;

  /**
   * @param cacheLengthInMinutes The number of minutes that the cache should be kept.
   * @param nowFn
   */
  constructor(cacheLengthInMinutes: number, nowFn: () => number = Date.now) {
    this._cacheLengthInMinutes = cacheLengthInMinutes;
    this._nowFn = nowFn;
  }

  set(key: string, value: ValueType) {
    this._cache.set(key, {
      data: value,
      cached_at_timestap: this._nowFn(),
    });
  }

  get(key: string): ValueType | undefined {
    const result = this._cache.get(key);

    if (
      !result ||
      !result.cached_at_timestap ||
      result.cached_at_timestap + this._cacheLengthInMinutes * 60 * 1_000 <
        this._nowFn()
    ) {
      return undefined;
    }

    return result.data;
  }
}

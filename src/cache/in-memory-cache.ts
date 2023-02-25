interface Value<T> {
  data: T;
  ts: Date;
}

export class InMemoryCache<T> {
  private _cache: Map<string, Value<T>> = new Map<string, Value<T>>();
  private readonly _cacheLengthInMinutes: number;

  constructor(cacheLengthInMinutes: number) {
    this._cacheLengthInMinutes = cacheLengthInMinutes;
  }

  set(key: string, value: T) {
    this._cache.set(key, {
      data: value,
      ts: new Date(),
    });
  }

  get(key: string): T | undefined {
    const result = this._cache.get(key);

    if (
      !result ||
      !result.ts ||
      result.ts < new Date(Date.now() + this._cacheLengthInMinutes * 60_000)
    ) {
      return undefined;
    }

    return result.data;
  }
}

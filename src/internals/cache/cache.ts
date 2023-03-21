export interface Cache<ValueType> {
  clear(): void;

  set(key: string, value: ValueType): void;

  get(key: string): Promise<ValueType | undefined>;

  setCacheExpirationInSeconds(cacheExpirationInSeconds: number): void;
}

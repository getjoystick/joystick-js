import { SdkCache } from "../../../../src/internals/cache/sdk-cache";
import { ApiResponse } from "../../../../src/models/api-response";
import * as redis from "redis";
import { RedisClientType } from "redis";

export class RedisCache implements SdkCache {
  private readonly _client: RedisClientType;
  private _cacheExpirationSeconds: number;
  private readonly _keys: Array<string> = new Array<string>();

  constructor(cacheExpirationSeconds: number) {
    this._client = redis.createClient();
    this._cacheExpirationSeconds = cacheExpirationSeconds;
  }

  async clear(): Promise<void> {
    if (!this._client.isOpen) {
      await this._client.connect();
    }

    for (const key of this._keys) {
      await this._client.del(key);
    }
  }

  async get(key: string): Promise<Record<string, ApiResponse> | undefined> {
    if (!this._client.isOpen) {
      await this._client.connect();
    }

    const result = await this._client.get(key);

    if (result == null) {
      return undefined;
    }

    return JSON.parse(result);
  }

  async set(key: string, value: Record<string, ApiResponse>): Promise<void> {
    if (!this._client.isOpen) {
      await this._client.connect();
    }

    this._keys.push(key);

    await this._client.setEx(
      key,
      this._cacheExpirationSeconds,
      JSON.stringify(value)
    );
  }

  setCacheExpirationSeconds(cacheExpirationSeconds: number): Promise<void> {
    this._cacheExpirationSeconds = cacheExpirationSeconds;

    return Promise.resolve();
  }

  async disconnect() {
    await this._client.quit();
  }
}

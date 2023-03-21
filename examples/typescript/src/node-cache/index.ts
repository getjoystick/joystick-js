import { Cache } from "../../../../src/internals/cache/cache";
import NodeCache from "node-cache";
import { Joystick } from "@getjoystick/vanilla-js";

export class NodeCacheImpl implements Cache<string> {
  private readonly cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      maxKeys: 1_000,
    });
  }

  clear(): void {
    this.cache.flushAll();
  }

  set(key: string, value: string): void {
    this.cache.set(key, value);
  }

  get(key: string): Promise<string | undefined> {
    return Promise.resolve(this.cache.get(key));
  }

  setCacheExpirationInSeconds(cacheExpirationInSeconds: number): void {
    this.cache.options.stdTTL = cacheExpirationInSeconds;
  }
}

new Joystick({});

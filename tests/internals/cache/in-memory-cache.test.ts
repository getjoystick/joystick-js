import { InMemoryCache } from "../../../src/internals/cache/in-memory-cache";

describe("InMemoryCache", () => {
  it("constructor", () => {
    const nowFn = () => 10;

    const cache = new InMemoryCache(10, undefined, nowFn);

    expect(cache).toBeDefined();
  });

  it("get", () => {
    let timelapse = 1_000_000;
    const nowFn = () => timelapse;

    const cache = new InMemoryCache(10, undefined, nowFn);

    cache.set("key", -1);

    expect(cache.get("key")).toBe(-1);

    timelapse *= 2;

    expect(cache.get("key")).toBeUndefined();
  });

  it("setCacheExpirationInSeconds", () => {
    const cache = new InMemoryCache(10);

    expect(() => cache.setCacheExpirationInSeconds(-1)).toThrow();

    expect(() => cache.setCacheExpirationInSeconds(0)).toThrow();

    expect(() => cache.setCacheExpirationInSeconds(1)).not.toThrow();
  });

  it("checkLruMaxSize", async () => {
    let timelapse = 1_000_000;
    const nowFn = () => timelapse;

    const cache = new InMemoryCache(10, 2, nowFn);

    cache.set("key1", -1);

    expect(cache.getCacheSize()).toBe(1);

    timelapse *= 2;

    cache.set("key2", -2);

    expect(cache.getCacheSize()).toBe(2);

    cache.set("key2", -3);

    expect(cache.getCacheSize()).toBe(2);

    cache.set("key3", -4);

    expect(cache.getCacheSize()).toBe(2);

    expect(await cache.get("key1")).toBeUndefined();
  });
});

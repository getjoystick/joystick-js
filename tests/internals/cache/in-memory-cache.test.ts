import { InMemoryCache } from "../../../src/internals/cache/in-memory-cache";

describe("InMemoryCache", () => {
  it("constructor", () => {
    const nowFn = () => 10;

    const cache = new InMemoryCache(10, nowFn);

    expect(cache).toBeDefined();
  });

  it("get", () => {
    let timelapse = 1_000_000;
    const nowFn = () => timelapse;

    const cache = new InMemoryCache<number>(10, nowFn);

    cache.set("key", -1);

    expect(cache.get("key")).toBe(-1);

    timelapse *= 2;

    expect(cache.get("key")).toBeUndefined();
  });
});

import { InMemoryCache } from "../../../src/internals/cache/in-memory-cache";
import { SdkLogger } from "../../../src/internals/logger/sdk-logger";
import { InvalidArgumentError } from "../../../src/errors/invalid-argument-error";
import { ApiResponse } from "../../../src/models/api-response";
import { mock } from "strong-mock";
import { Logger } from "../../../src/internals/logger/logger";

const createSampleApiResponse = (data: ApiResponse["data"]) => ({
  data,
  hash: "hash",
  meta: {
    uid: 0,
    mod: 0,
    variants: [],
    seg: [],
  },
});

describe("test InMemoryCache", () => {
  it("init", () => {
    const logger = new SdkLogger();

    const sut = new InMemoryCache(10, logger);

    expect(sut.getCacheSize()).toEqual(0);
  });

  it("CCVD-05 - cacheExpirationSeconds - constructor", () => {
    expect(() => new InMemoryCache(0, mock<Logger>())).not.toThrow();

    expect(() => new InMemoryCache(-2, mock<Logger>())).toThrow(
      new InvalidArgumentError(
        "Invalid cacheExpirationSeconds: <-2>. It should be equal or greater than 0"
      )
    );
  });

  it("get", async () => {
    let timelapse = 1_000_000;

    const logger = new SdkLogger();
    const nowFn = () => timelapse;

    const cache = new InMemoryCache(10, logger, undefined, nowFn);

    const value = {
      c1: createSampleApiResponse({
        foo: "bar",
      }),
    };

    await cache.set("key", value);

    expect(await cache.get("key")).toEqual(value);

    timelapse *= 2;

    expect(await cache.get("key")).toBeUndefined();
  });

  it("CCVD-05 - setCacheExpirationSeconds", () => {
    const logger = new SdkLogger();

    const sut = new InMemoryCache(10, logger);

    expect(async () => await sut.setCacheExpirationSeconds(-1)).rejects.toThrow(
      new InvalidArgumentError(
        "Invalid cacheExpirationSeconds: <-1>. It should be equal or greater than 0"
      )
    );

    expect(async () => await sut.setCacheExpirationSeconds(1)).not.toThrow();
  });

  it("checkLruMaxSize", async () => {
    let timelapse = 1_000_000;
    const nowFn = () => timelapse;

    const logger = new SdkLogger();

    const cache = new InMemoryCache(10, logger, 2, nowFn);

    const value = {
      c1: createSampleApiResponse({
        foo: "bar",
      }),
    };

    await cache.set("key1", value);

    expect(cache.getCacheSize()).toBe(1);

    timelapse *= 2;

    await cache.set("key2", value);

    expect(cache.getCacheSize()).toBe(2);

    await cache.set("key2", value);

    expect(cache.getCacheSize()).toBe(2);

    await cache.set("key3", value);

    expect(cache.getCacheSize()).toBe(2);

    expect(await cache.get("key1")).toBeUndefined();
  });
});

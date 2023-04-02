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

    const sut = new InMemoryCache({
      cacheExpirationInSeconds: 10,
      logger,
    });

    expect(sut.getCacheSize()).toEqual(0);
  });

  it("CCVD-05 - cacheExpirationInSeconds - constructor", () => {
    expect(
      () =>
        new InMemoryCache({
          cacheExpirationInSeconds: 0,
          logger: mock<Logger>(),
        })
    ).not.toThrow();

    expect(
      () =>
        new InMemoryCache({
          cacheExpirationInSeconds: -2,
          logger: mock<Logger>(),
        })
    ).toThrow(
      new InvalidArgumentError(
        "Invalid cacheExpirationInSeconds: <-2>. It should be equal or greater than 0"
      )
    );
  });

  it("get", async () => {
    let timelapse = 1_000_000;

    const logger = new SdkLogger();
    const nowFn = () => timelapse;

    const cache = new InMemoryCache({
      cacheExpirationInSeconds: 10,
      logger,
      nowFn,
    });

    const value = {
      c1: createSampleApiResponse({
        foo: "bar",
      }),
    };

    cache.set("key", value);

    expect(await cache.get("key")).toEqual(value);

    timelapse *= 2;

    expect(await cache.get("key")).toBeUndefined();
  });

  it("CCVD-05 - setCacheExpirationInSeconds", () => {
    const logger = new SdkLogger();

    const sut = new InMemoryCache({ cacheExpirationInSeconds: 10, logger });

    expect(() => sut.setCacheExpirationInSeconds(-1)).toThrow(
      new InvalidArgumentError(
        "Invalid cacheExpirationInSeconds: <-1>. It should be equal or greater than 0"
      )
    );

    expect(() => sut.setCacheExpirationInSeconds(1)).not.toThrow();
  });

  it("checkLruMaxSize", async () => {
    let timelapse = 1_000_000;
    const nowFn = () => timelapse;

    const logger = new SdkLogger();

    const cache = new InMemoryCache({
      cacheExpirationInSeconds: 10,
      maxItemsInCache: 2,
      logger,
      nowFn,
    });

    const value = {
      c1: createSampleApiResponse({
        foo: "bar",
      }),
    };

    cache.set("key1", value);

    expect(cache.getCacheSize()).toBe(1);

    timelapse *= 2;

    cache.set("key2", value);

    expect(cache.getCacheSize()).toBe(2);

    cache.set("key2", value);

    expect(cache.getCacheSize()).toBe(2);

    cache.set("key3", value);

    expect(cache.getCacheSize()).toBe(2);

    expect(await cache.get("key1")).toBeUndefined();
  });
});

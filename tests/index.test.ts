import { It, mock, reset, when } from "strong-mock";
import { Joystick } from "../src";
import { JoystickApiClient } from "../src/clients/joystick-api-client";
import { ApiResponse } from "../src/models/api-response";
import { InvalidArgumentError } from "../src/errors/invalid-argument-error";
import { SdkCache } from "../src/internals/cache/sdk-cache";
import { InMemoryCache } from "../src/internals/cache/in-memory-cache";

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

describe("Construction of the client", () => {
  let mockApiClient: JoystickApiClient;

  it("CN-01 - independent instances", () => {
    const sut1 = new Joystick({
      properties: {
        apiKey: "FIRST-API-KEY",
      },
    });

    expect(sut1.getApiKey()).toBe("FIRST-API-KEY");
    expect(sut1.getUserId()).toBeUndefined();

    const sut2 = new Joystick({
      properties: {
        apiKey: "SECOND-API-KEY",
        userId: "USER-ID-UNKNOWN",
      },
    });

    expect(sut2.getApiKey()).toBe("SECOND-API-KEY");
    expect(sut2.getUserId()).toBe("USER-ID-UNKNOWN");

    expect(sut1.getApiKey()).toBe("FIRST-API-KEY");
    expect(sut1.getUserId()).toBeUndefined();
  });

  it("CN-02 - not sharing cache", async () => {
    mockApiClient = mock<JoystickApiClient>();

    when(() =>
      mockApiClient.getDynamicContent(It.isObject({ contentIds: ["10"] }))
    ).thenResolve({
      10: createSampleApiResponse("initial-data-from-http"),
    });

    const sut1 = new Joystick({
      properties: {
        apiKey: "123",
      },
      apiClient: mockApiClient,
    });

    expect(sut1.getApiKey()).toBe("123");
    expect(sut1.getUserId()).toBeUndefined();

    // from http
    expect(await sut1.getContent({ contentId: "10" })).toEqual({
      "10": {
        data: "initial-data-from-http",
      },
    });

    when(() =>
      mockApiClient.getDynamicContent(It.isObject({ contentIds: ["10"] }))
    ).thenResolve({
      10: createSampleApiResponse("fresh-data-from-http"),
    });

    // from cache
    expect(await sut1.getContent({ contentId: "10" })).toEqual({
      "10": {
        data: "initial-data-from-http",
      },
    });

    const sut2 = new Joystick({
      properties: {
        apiKey: "231",
        userId: "USER-ID-UNKNOWN",
      },
      apiClient: mockApiClient,
    });

    expect(sut2.getApiKey()).toBe("231");
    expect(sut2.getUserId()).toBe("USER-ID-UNKNOWN");

    // from http - so cache is not shared
    expect(await sut2.getContent({ contentId: "10" })).toEqual({
      "10": {
        data: "fresh-data-from-http",
      },
    });

    when(() =>
      mockApiClient.getDynamicContent(It.isObject({ contentIds: ["10"] }))
    ).thenResolve({
      10: createSampleApiResponse("most-fresh-data-from-http"),
    });

    // from cache
    expect(await sut2.getContent({ contentId: "10" })).toEqual({
      "10": {
        data: "fresh-data-from-http",
      },
    });
  });

  it("CN-03 - should accept all possible parameters in the form of single object", () => {
    const sut = new Joystick({
      properties: {
        apiKey: "123",
        userId: "456",
        semVer: "2.1.0",
        params: {
          test: "test1",
        },
        options: {
          cacheExpirationInSeconds: 9999,
          serialized: true,
        },
      },
    });

    expect(sut.getApiKey()).toBe("123");
    expect(sut.getUserId()).toBe("456");
    expect(sut.getSemVer()).toBe("2.1.0");
    expect(sut.getParams()).toStrictEqual({
      test: "test1",
    });
    expect(sut.getParamValue("test")).toBe("test1");
    expect(sut.getParamValue("test")).toBe("test1");
    expect(sut.getParamValue("unknow-key")).toBeUndefined();
    expect(sut.getCacheExpirationInSeconds()).toBe(9999);
  });

  it("CN-04 - constructor doesn't receive valid API key", () => {
    expect(
      () =>
        new Joystick({
          properties: {
            apiKey: " ",
          },
        })
    ).toThrow(new InvalidArgumentError("Invalid apiKey:  "));

    expect(
      () =>
        new Joystick({
          properties: {
            apiKey: "",
          },
        })
    ).toThrow(new InvalidArgumentError("Invalid apiKey: "));
  });

  it("CN-04 - constructor doesn't receive valid userId", () => {
    expect(
      () =>
        new Joystick({
          properties: {
            apiKey: "SOME-KEY",
            userId: " ",
          },
        })
    ).toThrow(new InvalidArgumentError("Invalid userId:  "));

    expect(
      () =>
        new Joystick({
          properties: {
            apiKey: "SOME-KEY",
            userId: "",
          },
        })
    ).not.toThrow(InvalidArgumentError);
  });

  it("CN-04 - constructor doesn't receive valid semVer", () => {
    expect(
      () =>
        new Joystick({
          properties: {
            apiKey: "SOME-KEY",
            semVer: "2",
          },
        })
    ).toThrow(new InvalidArgumentError("Invalid semVer: 2"));

    expect(
      () =>
        new Joystick({
          properties: {
            apiKey: "SOME-KEY",
            semVer: "0.0.2",
          },
        })
    ).not.toThrow(InvalidArgumentError);
  });

  afterEach(() => {
    if (mockApiClient) {
      reset(mockApiClient);
    }
  });
});

describe("Validation of Client configuration", () => {
  it("CCVD-01 - only apiKey required", () => {
    const sut = new Joystick({
      properties: {
        apiKey: "123",
      },
    });

    expect(sut.getApiKey()).toBe("123");

    expect(
      () =>
        new Joystick({
          properties: {
            apiKey: "",
          },
        })
    ).toThrow(new InvalidArgumentError("Invalid apiKey: "));

    expect(
      () =>
        new Joystick({
          properties: {
            apiKey: "  ",
          },
        })
    ).toThrow(new InvalidArgumentError("Invalid apiKey:   "));
  });

  it("CCVD-02 - getUserId", () => {
    let sut = new Joystick({
      properties: {
        apiKey: "123",
        params: {},
      },
    });

    expect(sut.getUserId()).toBeUndefined();

    sut = new Joystick({
      properties: {
        apiKey: "123",
        userId: "456",
      },
    });

    expect(sut.getUserId()).toBe("456");

    sut.setUserId("789");

    expect(sut.getUserId()).toBe("789");

    sut.setUserId(undefined);

    expect(sut.getUserId()).toBeUndefined();

    sut.setUserId("");

    expect(sut.getUserId()).toBe("");

    expect(() => sut.setUserId(" ")).toThrow(
      new InvalidArgumentError("Invalid userId:  ")
    );
  });

  it("CCVD-03 - getParams", () => {
    let sut = new Joystick({
      properties: {
        apiKey: "123",
        params: {},
      },
    });

    expect(sut.getParams()).toEqual({});

    sut = new Joystick({
      properties: {
        apiKey: "123",
        params: {
          foo: "bar",
          name: "some-name",
        },
      },
    });

    expect(sut.getParams()).toEqual({
      foo: "bar",
      name: "some-name",
    });

    sut.setParams({
      foo: "baz",
    });

    expect(sut.getParams()).toEqual({
      foo: "baz",
    });

    sut.setParamValue("19", undefined);

    expect(sut.getParams()).toEqual({
      foo: "baz",
      19: undefined,
    });

    sut.setParams({});

    expect(sut.getParams()).toEqual({});
  });

  it("CCVD-04 - getSemVer", () => {
    let sut = new Joystick({
      properties: {
        apiKey: "123",
      },
    });

    expect(sut.getSemVer()).toBeUndefined();

    sut = new Joystick({
      properties: {
        apiKey: "123",
        semVer: "1.3.4",
      },
    });

    expect(sut.getSemVer()).toBe("1.3.4");

    expect(() => sut.setSemVer("2")).toThrowError(
      new InvalidArgumentError("Invalid semVer: 2")
    );

    expect(() => sut.setSemVer("a.b.c")).toThrowError(
      new InvalidArgumentError("Invalid semVer: a.b.c")
    );

    expect(() => sut.setSemVer("1 .2.4")).toThrowError(
      new InvalidArgumentError("Invalid semVer: 1 .2.4")
    );

    expect(sut.getSemVer()).toBe("1.3.4");

    sut.setSemVer("0.0.1");

    expect(sut.getSemVer()).toBe("0.0.1");

    sut.setSemVer(undefined);

    expect(sut.getSemVer()).toBeUndefined();
  });

  it("CCVD-05 - getCacheExpirationInSeconds", () => {
    let sut = new Joystick({
      properties: {
        apiKey: "123",
      },
    });

    expect(sut.getCacheExpirationInSeconds()).toBe(300);

    sut = new Joystick({
      properties: {
        apiKey: "123",
        options: {
          cacheExpirationInSeconds: 10,
        },
      },
    });

    expect(sut.getCacheExpirationInSeconds()).toBe(10);

    expect(() => sut.setCacheExpirationInSeconds(-20)).toThrowError(
      "Invalid cacheExpirationInSeconds"
    );

    sut.setCacheExpirationInSeconds(11);

    expect(sut.getCacheExpirationInSeconds()).toBe(11);
  });
});

describe("Caching Logic", () => {
  it("CL-01 - specify custom cache implementation", () => {
    let cleared = false;

    class MyCache implements SdkCache {
      clear(): void {
        cleared = true;
      }

      get(key: string): Promise<Record<string, ApiResponse> | undefined> {
        return Promise.resolve(undefined);
      }

      set(key: string, value: Record<string, ApiResponse>): void {}

      setCacheExpirationInSeconds(cacheExpirationInSeconds: number): void {}
    }

    const cache = new MyCache();

    const sut = new Joystick({
      properties: {
        apiKey: "123",
      },
      cache,
    });

    expect(sut.getCache()).toBeInstanceOf(MyCache);

    expect(cleared).toBeFalsy();

    sut.clearCache();

    expect(cleared).toBeTruthy();
  });

  it("CL-02 - In Memory cache", () => {
    const sut = new Joystick({
      properties: {
        apiKey: "123",
      },
    });

    expect(sut.getCache()).toBeInstanceOf(InMemoryCache);
  });
});

describe("Get Contents method call", () => {
  let mockApiClient: JoystickApiClient;

  it("GCS-01 - getContents receives valid contentIds", async () => {
    const sut = new Joystick({
      properties: {
        apiKey: "123",
      },
    });

    await expect(() => sut.getContents({ contentIds: [] })).rejects.toThrow(
      new InvalidArgumentError(
        "The contentIds parameter must be a non-empty array of strings"
      )
    );

    await expect(() =>
      sut.getContents({ contentIds: ["1", "", "3"] })
    ).rejects.toThrow(
      new InvalidArgumentError(
        "The contentIds parameter must be a non-empty array of strings"
      )
    );
  });

  it("default cacheExpirationInSeconds", () => {
    let sut = new Joystick({
      properties: {
        apiKey: "111312",
      },
    });

    expect(sut.getCacheExpirationInSeconds()).toBe(300);

    sut = new Joystick({
      properties: {
        apiKey: "111312",
        options: {
          cacheExpirationInSeconds: 9998,
        },
      },
    });

    expect(sut.getCacheExpirationInSeconds()).toBe(9998);

    expect(() => sut.setCacheExpirationInSeconds(-1)).toThrow(
      "Invalid cacheExpirationInSeconds: -1"
    );

    sut.setCacheExpirationInSeconds(11);

    expect(sut.getCacheExpirationInSeconds()).toBe(11);
  });

  it("getContent - responseType=serialized fullResponse=true", async () => {
    mockApiClient = mock<JoystickApiClient>();

    when(() =>
      mockApiClient.getDynamicContent(
        It.isObject({
          contentIds: It.isArray(["key1"]),
          payload: It.isAny(),
          responseType: "serialized",
        })
      )
    ).thenResolve({
      key1: createSampleApiResponse(
        JSON.stringify({
          id: "item.1",
        })
      ),
    });

    const sut = new Joystick({
      properties: {
        apiKey: "123",
      },
      apiClient: mockApiClient,
    });

    expect(
      await sut.getContent({
        contentId: "key1",
        options: {
          fullResponse: true,
          serialized: true,
        },
      })
    ).toEqual({
      key1: {
        data: '{"id":"item.1"}',
        hash: "hash",
        meta: {
          mod: 0,
          seg: [],
          uid: 0,
          variants: [],
        },
      },
    });
  });

  it("getContent - fullResponse=false", async () => {
    mockApiClient = mock<JoystickApiClient>();

    when(() =>
      mockApiClient.getDynamicContent(
        It.isObject({
          contentIds: It.isArray(["key2"]),
          payload: It.isAny(),
          responseType: It.isAny(),
        })
      )
    )
      .thenResolve({
        key2: createSampleApiResponse({
          id: "item.1",
        }),
      })
      .once();

    const sut = new Joystick({
      properties: {
        apiKey: "123",
      },
      apiClient: mockApiClient,
    });

    expect(
      await sut.getContent({
        contentId: "key2",
        options: {
          fullResponse: false,
        },
      })
    ).toEqual({
      key2: {
        data: { id: "item.1" },
      },
    });

    //from cache
    expect(
      await sut.getContent({
        contentId: "key2",
        options: {
          fullResponse: false,
        },
      })
    ).toEqual({
      key2: {
        data: { id: "item.1" },
      },
    });
  });

  it("getParamValue", () => {
    let sut = new Joystick({
      properties: {
        apiKey: "123",
      },
    });

    expect(sut.getParamValue("key")).toBe(undefined);

    sut = new Joystick({
      properties: {
        apiKey: "123",
        params: {
          key: "value",
        },
      },
    });

    expect(sut.getParamValue("key")).toBe("value");

    sut.setParamValue("key", "another-value");

    expect(sut.getParamValue("key")).toBe("another-value");

    sut.setParamValue("key", null);

    expect(sut.getParamValue("key")).toBe(null);

    sut.setParams({
      _k1: undefined,
      _m3: {
        _k2: "value",
      },
    });

    expect(sut.getParamValue("key")).toBeUndefined();

    expect(sut.getParamValue("_m3")).toEqual({
      _k2: "value",
    });

    sut.setParamValue("key", { name: "Miguel" });

    const paramValue = sut.getParamValue<{ name: string }>("key");

    expect(paramValue?.name).toBe("Miguel");
  });

  it("call API", async () => {
    const sut = new Joystick({
      properties: {
        apiKey: process.env.JOYSTICK_API_KEY!,
        semVer: "1.0.0",
        params: {},
      },
    });

    const resultv1 = await sut.getContent({ contentId: "first_config" });

    expect(resultv1).toEqual({
      first_config: {
        name: "Miguel",
      },
    });

    sut.setSemVer("2.0.0");

    const resultv2 = await sut.getContent({ contentId: "first_config" });

    expect(resultv2).toEqual({
      first_config: {
        name: "Miguel",
      },
    });
  });

  afterEach(() => {
    if (mockApiClient) {
      reset(mockApiClient);
    }
  });
});

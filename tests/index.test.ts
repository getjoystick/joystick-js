import { It, mock, reset, when } from "strong-mock";
import { ApiClient } from "../src/clients/api-client";
import { Joystick } from "../src";
import * as dotenv from "dotenv";

dotenv.config();

describe("test SDK", () => {
  let mockApiClient: ApiClient;

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
    ).toThrow("Invalid apiKey: ");

    expect(
      () =>
        new Joystick({
          properties: {
            apiKey: "  ",
          },
        })
    ).toThrow("Invalid apiKey: ");
  });

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
    mockApiClient = mock<ApiClient>();

    const sut1 = new Joystick({
      properties: {
        apiKey: "123",
      },
      apiClient: mockApiClient,
    });

    expect(sut1.getApiKey()).toBe("123");
    expect(sut1.getUserId()).toBeUndefined();

    const sut2 = new Joystick({
      properties: {
        apiKey: "123",
        userId: "USER-ID-UNKNOWN",
      },
    });

    expect(sut2.getApiKey()).toBe("123");
    expect(sut2.getUserId()).toBe("USER-ID-UNKNOWN");
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

  it("getContent", async () => {
    mockApiClient = mock<ApiClient>();

    when(() =>
      mockApiClient.getDynamicContent(It.isAny(), It.isAny())
    ).thenResolve({
      key1: {
        hash: "hash",
        data: JSON.stringify({
          id: "item.1",
        }),
        meta: {
          uid: 1,
          mod: 0,
          seg: [],
        },
      },
      key2: {
        hash: "hash2",
        data: JSON.stringify({
          id: "item.21",
        }),
        meta: {
          uid: 1,
          mod: 0,
          seg: [],
        },
      },
    });

    const sut = new Joystick({
      properties: {
        apiKey: "123",
      },
      apiClient: mockApiClient,
    });

    expect(await sut.getContent("key1")).toEqual({
      key1: {
        id: "item.1",
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
  });

  it("getParams", () => {
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

    expect(() => sut.setSemVer("2")).toThrowError("Invalid semVer: 2");

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

  it("call API", async () => {
    const sut = new Joystick({
      properties: {
        apiKey: process.env.JOYSTICK_API_KEY!,
        semVer: "1.0.0",
        params: {},
      },
    });

    const resultv1 = await sut.getContent("first_config");

    expect(resultv1).toEqual({
      first_config: {
        name: "Miguel",
      },
    });

    sut.setSemVer("2.0.0");

    const resultv2 = await sut.getContent("first_config");

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

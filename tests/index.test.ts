import { It, mock, reset, when } from "strong-mock";
import { ApiClient } from "../src/clients/api-client";
import { Joystick } from "../src";
import * as dotenv from "dotenv";

dotenv.config();

describe("test SDK", () => {
  let mockApiClient: ApiClient;

  it("only apiKey required", () => {
    const sut = new Joystick({
      apiKey: "123",
    });

    expect(sut.getApiKey()).toBe("123");
  });

  it("init", () => {
    const sut = new Joystick({
      apiKey: "123",
      userId: "456",
    });

    expect(sut.getApiKey()).toBe("123");
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

    const sut = new Joystick(
      {
        apiKey: "123",
      },
      (_) => mockApiClient
    );

    expect(await sut.getContent("key1")).toEqual({
      key1: {
        data: {
          id: "item.1",
        },
        hash: "hash",
        meta: {
          mod: 0,
          seg: [],
          uid: 1,
        },
      },
    });
  });

  it("getUserId", () => {
    let sut = new Joystick({
      apiKey: "123",
    });

    expect(sut.getUserId()).toBeUndefined();

    sut = new Joystick({
      apiKey: "123",
      userId: "456",
    });

    expect(sut.getUserId()).toBe("456");

    sut.setUserId("789");

    expect(sut.getUserId()).toBe("789");

    sut.setUserId(undefined);

    expect(sut.getUserId()).toBeUndefined();
  });

  it("getParams", () => {
    let sut = new Joystick({
      apiKey: "123",
    });

    expect(sut.getParams()).toEqual({});

    sut = new Joystick({
      apiKey: "123",
      params: {
        foo: "bar",
        name: "some-name",
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

    sut.setParams(undefined);

    expect(sut.getParams()).toEqual({});
  });

  it("getSemVer", () => {
    let sut = new Joystick({
      apiKey: "123",
    });

    expect(sut.getSemVer()).toBeUndefined();

    sut = new Joystick({
      apiKey: "123",
      semVer: "1.3.4",
    });

    expect(sut.getSemVer()).toBe("1.3.4");

    expect(() => sut.setSemVer("2")).toThrowError("Invalid semver");

    sut.setSemVer("0.0.1");

    expect(sut.getSemVer()).toBe("0.0.1");

    sut.setSemVer(undefined);

    expect(sut.getSemVer()).toBeUndefined();
  });

  it("getCacheExpirationInSeconds", () => {
    let sut = new Joystick({
      apiKey: "123",
    });

    expect(sut.getCacheExpirationInSeconds()).toBe(300);

    sut = new Joystick({
      apiKey: "123",
      options: {
        cacheExpirationInSeconds: 10,
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
      apiKey: process.env.JOYSTICK_API_KEY!,
      semVer: "1.0.0",
    });

    const resultv1 = await sut.getContent("first_config");

    expect(resultv1).toEqual({});

    sut.setSemVer("2");

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

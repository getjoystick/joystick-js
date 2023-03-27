import { AxiosClient } from "../../../src/internals/client/axios-client";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { SdkLogger } from "../../../src/internals/logger/sdk-logger";
import { ApiServerError } from "../../../src/errors/api-server-error";
import { ApiBadRequestError } from "../../../src/errors/api-bad-request-error";
import { ApiUnkownError } from "../../../src/errors/api-unkown-error";

describe("test AxiosClient", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it("post", async () => {
    const sut = new AxiosClient({ apiKey: "api.key", logger: new SdkLogger() });

    const name = "name";

    mock.onPost("/ping").reply(200, "pong122");

    const value = await sut.post({
      url: "/ping",
      payload: {
        name,
      },
    });

    expect(value).toEqual("pong122");

    expect(mock.history.post.length).toBe(1);

    expect(mock.history.post[0].url).toBe("/ping");
  });

  it("401 Forbidden", async () => {
    const errorForbidden =
      'Error 401,  https://api.getjoystick.com/api/v1/config/123456789012345678901234567/dynamic?responsetype=serialized {"Data":false,"Status":4,"Message":"Forbidden","Details":null}.';

    const sut = new AxiosClient({ apiKey: "api.key", logger: new SdkLogger() });

    mock.onPost("/ping").reply(200, { key: errorForbidden });

    const value = await sut.post({
      url: "/ping",
      payload: {},
    });

    expect(value).toEqual({ key: errorForbidden });
  });

  it("GCS-09 - ApiServerError - 500 Internal Server Error", async () => {
    const sut = new AxiosClient({ apiKey: "api.key", logger: new SdkLogger() });

    mock.onPost("/ping").reply(500);

    await expect(() =>
      sut.post({
        url: "/ping",
        payload: {},
      })
    ).rejects.toThrow(ApiServerError);

    mock.onPut("/ping").reply(599);

    await expect(() =>
      sut.put({
        url: "/ping",
        payload: {},
      })
    ).rejects.toThrow(ApiServerError);
  });

  it("GCS-09 - ApiBadRequestError - 400 Bad Request Error", async () => {
    const sut = new AxiosClient({ apiKey: "api.key", logger: new SdkLogger() });

    mock.onPost("/ping").reply(400);

    await expect(() =>
      sut.post({
        url: "/ping",
        payload: {},
      })
    ).rejects.toThrow(ApiBadRequestError);

    mock.onPut("/ping").reply(499);

    await expect(() =>
      sut.put({
        url: "/ping",
        payload: {},
      })
    ).rejects.toThrow(ApiBadRequestError);
  });

  it("GCS-09 - ApiUnkownError - 301 Redirect", async () => {
    const sut = new AxiosClient({ apiKey: "api.key", logger: new SdkLogger() });

    mock.onPost("/ping").reply(301);

    await expect(() =>
      sut.post({
        url: "/ping",
        payload: {},
      })
    ).rejects.toThrow(ApiUnkownError);

    mock.onPut("/ping").reply(201);

    await expect(() =>
      sut.put({
        url: "/ping",
        payload: {},
      })
    ).rejects.toThrow(ApiUnkownError);
  });
});

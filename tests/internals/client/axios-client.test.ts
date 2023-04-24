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
    const sut = new AxiosClient("api.key", new SdkLogger());

    const name = "name";

    mock.onPost("/ping").reply(200, "pong122");

    const value = await sut.post("/ping", {
      name,
    });

    expect(value).toEqual("pong122");

    expect(mock.history.post.length).toBe(1);

    expect(mock.history.post[0].url).toBe("/ping");
  });

  it("401 Forbidden", async () => {
    const errorForbidden =
      'Error 401,  https://api.getjoystick.com/api/v1/config/123456789012345678901234567/dynamic?responsetype=serialized {"Data":false,"Status":4,"Message":"Forbidden","Details":null}.';

    const sut = new AxiosClient("api.key", new SdkLogger());

    mock.onPost("/ping").reply(200, { key: errorForbidden });

    const value = await sut.post("/ping", {});

    expect(value).toEqual({ key: errorForbidden });
  });

  it("GCS-09 - ApiServerError - 500 Internal Server Error", async () => {
    const sut = new AxiosClient("api.key", new SdkLogger());

    for (let status = 500; status < 600; status++) {
      mock.onPost("/ping").reply(status);

      await expect(() => sut.post("/ping", {})).rejects.toThrow(ApiServerError);

      mock.onPut("/ping").reply(status);

      await expect(() => sut.put("/ping", {})).rejects.toThrow(ApiServerError);
    }
  });

  it("GCS-09 - ApiBadRequestError - 400 Bad Request Error", async () => {
    const sut = new AxiosClient("api.key", new SdkLogger());

    for (let status = 400; status < 500; status++) {
      mock.onPost("/ping").reply(status);

      await expect(() => sut.post("/ping", {})).rejects.toThrow(
        ApiBadRequestError
      );

      mock.onPut("/ping").reply(status);

      await expect(() => sut.put("/ping", {})).rejects.toThrow(
        ApiBadRequestError
      );
    }
  });

  it("GCS-09 - ApiUnkownError - <> 200", async () => {
    const sut = new AxiosClient("api.key", new SdkLogger());

    for (let status = 201; status < 400; status++) {
      mock.onPost("/ping").reply(status);

      await expect(() => sut.post("/ping", {})).rejects.toThrow(ApiUnkownError);

      mock.onPut("/ping").reply(status);

      await expect(() => sut.put("/ping", {})).rejects.toThrow(ApiUnkownError);
    }
  });
});

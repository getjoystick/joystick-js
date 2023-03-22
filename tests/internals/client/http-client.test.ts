import { AxiosClient } from "../../../src/internals/client/axios-client";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { SdkLogger } from "../../../src/internals/logger/sdk-logger";

describe("test HttpClient", () => {
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

    expect(value).toEqual("pong122");
  });
});

import { AxiosClient } from "../../src/internals/client/axios-client";
import { JoystickApiClient } from "../../src/clients/joystick-api-client";

describe("test JoystickApiClient", () => {
  it("getContent", async () => {
    const apiKey = "apiKey";

    const sut = new JoystickApiClient({
      client: new AxiosClient({ apiKey, logger: console }),
      logger: console,
    });

    expect(
      await sut.getDynamicContent({
        contentIds: ["123456789012345678901234567"],
        payload: {
          params: {},
        },
      })
    ).toEqual({
      data: {
        content: {
          id: "1234567890",
        },
      },
      hash: "harsh",
      meta: {
        mod: 2,
        seg: [{}],
        uid: 1,
      },
    });
  });
});

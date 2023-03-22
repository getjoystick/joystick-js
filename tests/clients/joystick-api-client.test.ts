import { AxiosClient } from "../../src/internals/client/axios-client";
import { JoystickApiClient } from "../../src/clients/joystick-api-client";
import { SdkLogger } from "../../src/internals/logger/sdk-logger";

describe("test JoystickApiClient", () => {
  it("getContent", async () => {
    const apiKey = "apiKey";

    const logger = new SdkLogger();

    const sut = new JoystickApiClient({
      client: new AxiosClient({ apiKey, logger }),
      logger,
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

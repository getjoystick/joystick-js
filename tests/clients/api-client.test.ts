import { ApiClient } from "../../src/clients/joystick-api-client";
import { AxiosClient } from "../../src/internals/client/axios-client";

describe("ApiClient", () => {
  it("getContent", async () => {
    const apiKey = "apiKey";

    const sut = new ApiClient(new AxiosClient(apiKey, console), console);

    expect(
      await sut.getDynamicContent(["123456789012345678901234567"], {
        params: {},
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

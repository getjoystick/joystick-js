import { ApiClient } from "../../src/clients/api-client";
import { HttpClient } from "../../src/internals/client/http-client";

describe("ApiClient", () => {
  it("getContent", async () => {
    const apiKey = "apiKey";

    const sut = new ApiClient(new HttpClient(apiKey, console), console);

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

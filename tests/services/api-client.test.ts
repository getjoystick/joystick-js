import { ApiClient } from "../../src/services/api-client";

describe("ApiClient", () => {
  it("getContent", async () => {
    const apiKey = "apiKey";

    const sut = new ApiClient(apiKey);

    expect(
      await sut.getDynamicContent(["123456789012345678901234567"], {})
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

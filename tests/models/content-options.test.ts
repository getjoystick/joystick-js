import { ContentOptions } from "../../src/models/content-options";

describe("ContentOptions", () => {
  it("init", () => {
    const sut: ContentOptions = {
      refresh: false,
      serialized: true,
      fullResponse: false,
    };

    expect(sut).toEqual({
      fullResponse: false,
      refresh: false,
      serialized: true,
    });
  });
});

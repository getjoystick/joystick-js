import { ContentOptions } from "../../src/models/content-options";

describe("ContentOptions", () => {
  it("init - full", () => {
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

  it("init - partial", () => {
    let sut: ContentOptions = {
      serialized: true,
      fullResponse: false,
    };

    expect(sut).toEqual({
      fullResponse: false,
      serialized: true,
    });

    sut = {
      serialized: true,
    };

    expect(sut).toEqual({
      serialized: true,
    });

    sut = {};

    expect(sut).toEqual({});
  });
});

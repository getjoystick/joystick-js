import { PublishContentUpdatePayload } from "../../src/models/publish-content-update-payload";

describe("test PublishContentUpdatePayload", () => {
  it("init - required properties", () => {
    const sut: PublishContentUpdatePayload = {
      content: {
        foo: "bar",
      },
      description: "description",
    };

    expect(sut).toEqual({
      description: "description",
      content: {
        foo: "bar",
      },
    });
  });

  it("init - full", () => {
    const sut: PublishContentUpdatePayload = {
      content: {},
      description: "",
      dynamicContentMap: [],
    };

    expect(sut).toEqual({
      description: "",
      content: {},
      dynamicContentMap: [],
    });
  });
});

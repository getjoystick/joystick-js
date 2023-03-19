import { Properties } from "../../src/models/properties";

describe("Properties", () => {
  it("init required properties", () => {
    const sut: Properties = {
      apiKey: "required",
      params: {},
    };

    expect(sut).toEqual({ apiKey: "required", params: {} });
  });
});

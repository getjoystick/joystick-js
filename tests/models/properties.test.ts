import { Properties } from "../../src/models/properties";

describe("Properties", () => {
  it("init required properties", () => {
    const sut: Properties = {
      apiKey: "required",
    };

    expect(sut).toEqual({ apiKey: "required" });
  });
});

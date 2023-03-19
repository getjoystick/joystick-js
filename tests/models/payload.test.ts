import { Payload } from "../../src/models/payload";

describe("Payload", () => {
  it("init", () => {
    const sut: Payload = {
      userId: "required-user-id",
      semVer: "required-semver",
      params: {},
    };

    expect(sut).toEqual({
      params: {},
      semVer: "required-semver",
      userId: "required-user-id",
    });
  });
});

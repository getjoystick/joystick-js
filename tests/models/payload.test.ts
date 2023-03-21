import { GetDynamicContentPayload } from "../../src/models/get-dynamic-content-payload";

describe("Payload", () => {
  it("init", () => {
    const sut: GetDynamicContentPayload = {
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

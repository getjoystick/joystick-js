import { GetDynamicContentPayload } from "../../src/models/get-dynamic-content-payload";

describe("test GetDynamicContentPayload", () => {
  it("init", () => {
    const sut: GetDynamicContentPayload = {
      userId: "required-user-id",
      semVer: "required-semver",
      params: {
        foo: "required-foo",
        bar: "required-bar",
      },
    };

    expect(sut).toEqual({
      params: {
        foo: "required-foo",
        bar: "required-bar",
      },
      semVer: "required-semver",
      userId: "required-user-id",
    });
  });
});

import { GetDynamicContentPayload } from "../../src/models/get-dynamic-content-payload";

describe("test GetDynamicContentPayload", () => {
  it("init - full", () => {
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

  it("init - partial", () => {
    let sut: GetDynamicContentPayload = {
      userId: "required-user-id",
      semVer: "required-semver",
    };

    expect(sut).toEqual({
      semVer: "required-semver",
      userId: "required-user-id",
    });

    sut = {
      semVer: "required-semver",
    };

    expect(sut).toEqual({
      semVer: "required-semver",
    });

    sut = {
      params: {},
    };

    expect(sut).toEqual({
      params: {},
    });

    sut = {
      params: {
        foo: "required-foo",
      },
    };

    expect(sut).toEqual({
      params: {
        foo: "required-foo",
      },
    });

    sut = {};

    expect(sut).toEqual({});
  });
});

import { Properties } from "../../src/models/properties";

describe("test Properties", () => {
  it("init - required properties", () => {
    const sut: Properties = {
      apiKey: "required",
    };

    expect(sut).toEqual({ apiKey: "required" });
  });

  it("init - full", () => {
    const sut: Properties = {
      apiKey: "1245",
      params: {},
      semVer: "semver",
      options: {
        cacheExpirationSeconds: 123,
        serialized: true,
      },
      userId: "",
    };

    expect(sut).toEqual({
      apiKey: "1245",
      params: {},
      semVer: "semver",
      options: {
        cacheExpirationSeconds: 123,
        serialized: true,
      },
      userId: "",
    });
  });
});

import { sha256ToHex } from "../../../src/internals/hash/sha256-to-hex";

describe("test sha256", () => {
  it("sha256ToHex(array)", async () => {
    const hash = await sha256ToHex([
      "JOYSTICK_API_KEY",
      {
        a: "a value",
        b: "b value",
      },
      "0.0.1",
      "USER-ID",
      ["sample-second"],
      true,
      true,
    ]);

    expect(hash).toBe(
      "c20acb3ca476a1eb90af5f20279c4d8309f6bbed77d8679fb6843915fc5780e6"
    );
  });

  it("sha256ToHex(str)", async () => {
    const hash = await sha256ToHex(
      JSON.stringify([
        "JOYSTICK_API_KEY",
        {
          a: "a value",
          b: "b value",
        },
        "0.0.1",
        "USER-ID",
        ["sample-second"],
        true,
        true,
      ])
    );

    expect(hash).toBe(
      "c20acb3ca476a1eb90af5f20279c4d8309f6bbed77d8679fb6843915fc5780e6"
    );
  });
});

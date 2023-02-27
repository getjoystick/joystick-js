describe("test-json", () => {
  it("spec name", () => {
    const payload = {
      userId: undefined,
      semVer: undefined,
      params: {},
    };

    const data = {
      u: payload.userId ?? "",
      v: payload.semVer,
      p: payload.params,
    };

    console.log(JSON.stringify(data));
  });
});

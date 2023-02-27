"use strict";
describe("test-json", () => {
    it("spec name", () => {
        var _a;
        const payload = {
            userId: undefined,
            semVer: undefined,
            params: {},
        };
        const data = {
            u: (_a = payload.userId) !== null && _a !== void 0 ? _a : "",
            v: payload.semVer,
            p: payload.params,
        };
        console.log(JSON.stringify(data));
    });
});

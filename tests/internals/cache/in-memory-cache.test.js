"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const in_memory_cache_1 = require("../../../src/internals/cache/in-memory-cache");
describe("InMemoryCache", () => {
    it("constructor", () => {
        const nowFn = () => 10;
        const cache = new in_memory_cache_1.InMemoryCache(10, nowFn);
        expect(cache).toBeDefined();
    });
    it("get", () => {
        let timelapse = 1000000;
        const nowFn = () => timelapse;
        const cache = new in_memory_cache_1.InMemoryCache(10, nowFn);
        cache.set("key", -1);
        expect(cache.get("key")).toBe(-1);
        timelapse *= 2;
        expect(cache.get("key")).toBeUndefined();
    });
});

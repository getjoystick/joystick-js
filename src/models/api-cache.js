"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiCache = void 0;
const in_memory_cache_1 = require("../internals/cache/in-memory-cache");
class ApiCache extends in_memory_cache_1.InMemoryCache {
}
exports.ApiCache = ApiCache;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCache = void 0;
/**
 * A class used to cache values in memory.
 * @overview A simple implementation to avoid dependencies
 */
class InMemoryCache {
    /**
     * @param cacheLengthInMinutes The number of minutes that the cache should be kept.
     * @param nowFn
     */
    constructor(cacheLengthInMinutes, nowFn = Date.now) {
        this._cache = new Map();
        this._cacheLengthInMinutes = cacheLengthInMinutes;
        this._nowFn = nowFn;
    }
    set(key, value) {
        this._cache.set(key, {
            data: value,
            cached_at_timestap: this._nowFn(),
        });
    }
    get(key) {
        const result = this._cache.get(key);
        if (!result ||
            !result.cached_at_timestap ||
            result.cached_at_timestap + this._cacheLengthInMinutes * 60 * 1000 <
                this._nowFn()) {
            return undefined;
        }
        return result.data;
    }
}
exports.InMemoryCache = InMemoryCache;

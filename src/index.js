"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Joystick = void 0;
const http_client_1 = require("./internals/client/http-client");
const api_cache_1 = require("./models/api-cache");
const api_client_1 = require("./clients/api-client");
const DEFAULT_CACHE_EXPIRATION_IN_SECONDS = 300;
const semVerRegExp = new RegExp(/^[0-9]+.[0-9]+.[0-9]+$/);
function validateProperties({ semVer, cacheExpirationInSeconds, }) {
    if (semVer && !semVerRegExp.test(semVer)) {
        throw new Error(`Invalid semVer: ${semVer}`);
    }
    if (cacheExpirationInSeconds != undefined && cacheExpirationInSeconds < 10) {
        throw new Error(`Invalid cacheExpirationInSeconds: ${cacheExpirationInSeconds}`);
    }
}
/**
 * Main class
 */
class Joystick {
    constructor(properties, fnApiClient = (apiKey) => new api_client_1.ApiClient(new http_client_1.HttpClient(apiKey, console))) {
        const { semVer, options: { cacheExpirationInSeconds } = {} } = properties;
        validateProperties({ semVer, cacheExpirationInSeconds });
        this._properties = properties;
        this._apiClient = fnApiClient(this.getApiKey());
    }
    getApiKey() {
        return this._properties.apiKey;
    }
    getUserId() {
        return this._properties.userId;
    }
    getSemVer() {
        return this._properties.semVer;
    }
    setSemVer(semVer) {
        validateProperties({ semVer });
        this._properties.semVer = semVer;
        this.clearCache();
    }
    getParams() {
        return this._properties.params || {};
    }
    getCacheExpirationInSeconds() {
        var _a;
        return (((_a = this._properties.options) === null || _a === void 0 ? void 0 : _a.cacheExpirationInSeconds) ||
            DEFAULT_CACHE_EXPIRATION_IN_SECONDS);
    }
    clearCache() {
        this._cache = undefined;
    }
    getContent(contentId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getContents([contentId], options);
        });
    }
    getContents(contentIds, options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const missingContentIdsFromCache = (options === null || options === void 0 ? void 0 : options.refresh)
                ? contentIds
                : contentIds.filter((contentId) => !this.getCache().get(contentId));
            const freshContent = yield this._apiClient.getDynamicContent(missingContentIdsFromCache, this._properties);
            if (freshContent) {
                Object.entries(freshContent).forEach(([contentId, content]) => {
                    this.getCache().set(contentId, content);
                });
            }
            const isSerializedActive = (_a = options === null || options === void 0 ? void 0 : options.serialized) !== null && _a !== void 0 ? _a : (_b = this._properties.options) === null || _b === void 0 ? void 0 : _b.serialized;
            return contentIds.reduce((result, contentId) => {
                const content = this.getCache().get(contentId);
                return Object.assign(Object.assign({}, result), { [contentId]: this.formatContent(content, isSerializedActive, options === null || options === void 0 ? void 0 : options.fullResponse) });
            }, {});
        });
    }
    setUserId(userId) {
        this._properties.userId = userId;
        this.clearCache();
    }
    setCacheExpirationInSeconds(value) {
        validateProperties({ cacheExpirationInSeconds: value });
        this._properties.options = Object.assign(Object.assign({}, this._properties.options), { cacheExpirationInSeconds: value });
        this.clearCache();
    }
    setParams(value) {
        this._properties.params = value;
        this.clearCache();
    }
    formatContent(content, isSerializedActive, fullResponse) {
        if (!content) {
            return {};
        }
        const { data, meta, hash } = content;
        const massagedData = isSerializedActive || !data ? data : JSON.parse(data);
        if (!fullResponse) {
            return massagedData;
        }
        return {
            data: massagedData,
            hash,
            meta,
        };
    }
    getCache() {
        if (!this._cache) {
            this._cache = new api_cache_1.ApiCache(this.getCacheExpirationInSeconds());
        }
        return this._cache;
    }
}
exports.Joystick = Joystick;

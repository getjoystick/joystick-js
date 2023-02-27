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
const api_client_1 = require("../services/api-client");
const api_cache_1 = require("./api-cache");
const DEFAULT_CACHE_LENGTH_IN_MINUTES = 10;
const defaultProps = {
    options: {
        cacheLength: DEFAULT_CACHE_LENGTH_IN_MINUTES,
    },
};
/**
 *
 */
class Joystick {
    constructor(fnApiClient = (apiKey) => new api_client_1.ApiClient(apiKey)) {
        this._props = defaultProps;
        this._fnApiClient = fnApiClient;
    }
    init(props) {
        this._props = Object.assign(Object.assign({}, this._props), props);
        this.clearCache();
    }
    getParams() {
        return this._props.params || {};
    }
    setParams(params) {
        this._props.params = params;
        this.clearCache();
    }
    setParamValue(key, value) {
        this.getParams()[key] = value;
        this.clearCache();
    }
    getApiKey() {
        return this._props.apiKey;
    }
    getUserId() {
        return this._props.userId;
    }
    getCacheLength() {
        var _a;
        return ((_a = this._props.options) === null || _a === void 0 ? void 0 : _a.cacheLength) || DEFAULT_CACHE_LENGTH_IN_MINUTES;
    }
    clearCache() {
        this._cache = undefined;
    }
    getContent(contentId, options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const content = this.getCache().get(contentId);
            if (content) {
                return {
                    [contentId]: content,
                };
            }
            const responseType = ((_a = options === null || options === void 0 ? void 0 : options.serialized) !== null && _a !== void 0 ? _a : (_b = this._props.options) === null || _b === void 0 ? void 0 : _b.serialize)
                ? "serialized"
                : undefined;
            const freshContent = yield this.getApiClient().getContent(contentId, Object.assign({}, this._props), responseType);
            if (!freshContent) {
                return;
            }
            this.getCache().set(contentId, freshContent);
            return {
                [contentId]: freshContent,
            };
        });
    }
    getContents(contentIds, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return contentIds.reduce((result, contentId) => {
                const content = this.getCache().get(contentId);
                if (!content) {
                    return result;
                }
                this.getCache().set(contentId, content);
                return Object.assign(Object.assign({}, result), { [contentId]: content });
            }, {});
        });
    }
    setApiKey(apiKey) {
        this._props.apiKey = apiKey;
        this.clearCache();
    }
    getCache() {
        if (!this._cache) {
            this._cache = new api_cache_1.ApiCache(this.getCacheLength());
        }
        return this._cache;
    }
    getApiClient() {
        if (!this._apiClient) {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                throw new Error("Please provide an API Key before calling getContent.");
            }
            this._apiClient = this._fnApiClient(apiKey);
        }
        return this._apiClient;
    }
}
exports.Joystick = Joystick;

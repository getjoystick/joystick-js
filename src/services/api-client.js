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
exports.ApiClient = void 0;
const http_client_1 = require("../internals/client/http-client");
class ApiClient {
    constructor(apiKey) {
        this._client = new http_client_1.HttpClient(apiKey);
    }
    getContent(contentId, payload, responseType) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._client.post(`/config/${contentId}/dynamic`, {
                u: (_a = payload.userId) !== null && _a !== void 0 ? _a : "",
                v: payload.semVer,
                p: payload.params,
            }, { responseType });
        });
    }
    getContents(contentIds, payload, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._client.post(`/combine`, {
                u: (_a = payload.userId) !== null && _a !== void 0 ? _a : "",
                v: payload.semVer,
                p: payload.params,
            }, {
                c: contentIds,
                dynamic: options === null || options === void 0 ? void 0 : options.dynamic,
                responseType: options === null || options === void 0 ? void 0 : options.responseType,
            });
        });
    }
}
exports.ApiClient = ApiClient;

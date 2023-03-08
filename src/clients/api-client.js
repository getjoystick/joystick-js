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
const ApiError_1 = require("../errors/ApiError");
/**
 * API Client to getContents, using REST protocol
 */
class ApiClient {
    constructor(client) {
        this._client = client;
    }
    /**
     * Gets the contents from Joystick API.
     *
     * The data is requested with dynamic=true&responseType=serialized to guarantee a raw format on cache
     *
     * All the transformations occur after retrieve the data from the cache.
     *
     */
    getDynamicContent(contentIds, payload) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._client.post(`/combine/`, {
                u: (_a = payload.userId) !== null && _a !== void 0 ? _a : "",
                v: payload.semVer,
                p: payload.params,
            }, {
                c: `[${contentIds.map((contentId) => `"${contentId}"`).join(",")}]`,
                dynamic: true,
                responseType: "serialized",
            });
            return Object.entries(response).reduce((acc, [key, value]) => {
                if (ApiError_1.ApiError.isApiResponseError(value)) {
                    throw new ApiError_1.ApiError(value);
                }
                return Object.assign(Object.assign({}, acc), { [key]: value });
            }, {});
        });
    }
}
exports.ApiClient = ApiClient;

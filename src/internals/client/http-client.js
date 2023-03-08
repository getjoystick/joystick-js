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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
const retry_logic_1 = require("./retry-logic");
const { JOYSTICK_TIMEOUT_IN_MS, JOYSTICK_BASE_URL } = process.env;
const baseUrl = JOYSTICK_BASE_URL || "https://api.getjoystick.com/api/v1";
const timeout = parseInt(JOYSTICK_TIMEOUT_IN_MS || "2500");
const ERRORS_REGEXP = new RegExp(/(\{.+}).$/);
class HttpClient {
    constructor(apiKey, logger) {
        this._logger = logger;
        this._client = axios_1.default.create({
            baseURL: baseUrl,
            timeout,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-Api-Key": apiKey,
            },
            responseEncoding: "UTF-8",
            responseType: "json",
        });
        this.checkResponseForErrors();
        (0, retry_logic_1.applyRetryLogic)(this._client, this._logger);
    }
    post(urlPath, payload, params) {
        return __awaiter(this, void 0, void 0, function* () {
            this._logger.debug({ urlPath, payload, params }, "Sending request to Joystick");
            const { data } = yield this._client.post(urlPath, payload, {
                params,
            });
            return data;
        });
    }
    checkResponseForErrors() {
        this._client.interceptors.response.use((response) => __awaiter(this, void 0, void 0, function* () {
            const { data } = response;
            const massagedData = Object.entries(data).reduce((acc, [key, value]) => {
                var _a;
                let massagedValue = value;
                if (typeof value === "string") {
                    massagedValue = (_a = ERRORS_REGEXP.exec(value)) === null || _a === void 0 ? void 0 : _a[1];
                    if (typeof massagedValue === "string") {
                        massagedValue = JSON.parse(massagedValue);
                    }
                }
                return Object.assign(Object.assign({}, acc), { [key]: massagedValue });
            }, {});
            this._logger.debug({ data });
            return Promise.resolve(Object.assign(Object.assign({}, response), { data: massagedData }));
        }));
    }
}
exports.HttpClient = HttpClient;

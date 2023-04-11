"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv = __importStar(require("dotenv"));
const joystick_js_1 = require("@getjoystick/joystick-js");
const redis_cache_1 = require("./redis-cache");
dotenv.config();
const redisCache = new redis_cache_1.RedisCache(2);
const joystick = new joystick_js_1.Joystick({
    apiKey: process.env.JOYSTICK_API_KEY || "",
    options: {
        cacheExpirationSeconds: 2,
    },
}, undefined, undefined, 
// new NodeCacheImpl(2)
redisCache);
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        let data = yield joystick.getContent("first_config", {
            fullResponse: true,
        });
        console.log("from API", data);
        data = yield joystick.getContent("first_config", {
            fullResponse: true,
        });
        console.log("from cache", data);
        yield new Promise((f) => setTimeout(f, 3 * 1000));
        data = yield joystick.getContent("first_config", {
            fullResponse: true,
        });
        console.log("from API again", data);
        data = yield joystick.getContent("first_config", {
            refresh: true,
        });
        console.log("from API again because refresh is true", data);
        yield redisCache.disconnect();
    });
})();

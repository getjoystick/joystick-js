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
const jest_mock_axios_1 = __importDefault(require("jest-mock-axios"));
const http_client_1 = require("../../../src/internals/client/http-client");
describe("HttpClient", () => {
    afterEach(() => {
        jest_mock_axios_1.default.reset();
    });
    it("post", () => __awaiter(void 0, void 0, void 0, function* () {
        const sut = new http_client_1.HttpClient("api.key");
        const name = "name";
        yield sut.post("/ping", { name });
        expect(jest_mock_axios_1.default.post).toHaveBeenCalledWith("/ping");
    }));
});

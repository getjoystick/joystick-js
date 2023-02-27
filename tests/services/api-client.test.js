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
const api_client_1 = require("../../src/services/api-client");
describe("ApiClient", () => {
    it("getContent", () => __awaiter(void 0, void 0, void 0, function* () {
        const apiKey = "apiKey";
        const sut = new api_client_1.ApiClient(apiKey);
        expect(yield sut.getContent("123456789012345678901234567", {})).toEqual({
            data: {
                content: {
                    id: "1234567890",
                },
            },
            hash: "harsh",
            meta: {
                mod: 2,
                seg: [{}],
                uid: 1,
            },
        });
    }));
});

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
const joystick_1 = require("../../src/models/joystick");
const ts_mockito_1 = require("ts-mockito");
const api_client_1 = require("../../src/services/api-client");
describe("test clearCache", () => {
    xit("init", () => {
        const sut = new joystick_1.Joystick();
        sut.init({
            apiKey: "123",
            userId: "456",
        });
        expect(sut.getApiKey()).toBe("123");
    });
    it("getContent throws error when API Key is not defined", () => __awaiter(void 0, void 0, void 0, function* () {
        const sut = new joystick_1.Joystick();
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () { return yield sut.getContent("item.1"); })).rejects.toThrowError("Please provide an API Key before calling getContent");
    }));
    it("getContent", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockApiClient = (0, ts_mockito_1.mock)(api_client_1.ApiClient);
        (0, ts_mockito_1.when)(mockApiClient.getContent((0, ts_mockito_1.anyString)(), (0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)())).thenResolve({
            hash: "hash",
            data: {
                id: "item.1",
            },
            meta: {
                uid: 1,
                mod: 0,
                seg: [],
            },
        });
        const apiClient = (0, ts_mockito_1.instance)(mockApiClient);
        const sut = new joystick_1.Joystick((_) => apiClient);
        sut.setApiKey("1213");
        expect(yield sut.getContent("item.1")).toBe("");
    }));
});

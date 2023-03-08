"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor({ errors, title }) {
        super(`${title}\n${JSON.stringify(errors)}`);
        this._errors = errors;
    }
    get errors() {
        return this._errors;
    }
    static isApiResponseError(response) {
        return response.errors !== undefined;
    }
}
exports.ApiError = ApiError;

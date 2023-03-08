"use strict";
/**
 *  Adapted Typescript version of the library axios-retry @link https://github.com/axios/axios-retry to avoid two new dependencies.
 */
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
exports.applyRetryLogic = exports.namespace = void 0;
const denyList = new Set([
    "ENOTFOUND",
    "ENETUNREACH",
    // SSL errors from https://github.com/nodejs/node/blob/fc8e3e2cdc521978351de257030db0076d79e0ab/src/crypto/crypto_common.cc#L301-L328
    "UNABLE_TO_GET_ISSUER_CERT",
    "UNABLE_TO_GET_CRL",
    "UNABLE_TO_DECRYPT_CERT_SIGNATURE",
    "UNABLE_TO_DECRYPT_CRL_SIGNATURE",
    "UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY",
    "CERT_SIGNATURE_FAILURE",
    "CRL_SIGNATURE_FAILURE",
    "CERT_NOT_YET_VALID",
    "CERT_HAS_EXPIRED",
    "CRL_NOT_YET_VALID",
    "CRL_HAS_EXPIRED",
    "ERROR_IN_CERT_NOT_BEFORE_FIELD",
    "ERROR_IN_CERT_NOT_AFTER_FIELD",
    "ERROR_IN_CRL_LAST_UPDATE_FIELD",
    "ERROR_IN_CRL_NEXT_UPDATE_FIELD",
    "OUT_OF_MEM",
    "DEPTH_ZERO_SELF_SIGNED_CERT",
    "SELF_SIGNED_CERT_IN_CHAIN",
    "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
    "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
    "CERT_CHAIN_TOO_LONG",
    "CERT_REVOKED",
    "INVALID_CA",
    "PATH_LENGTH_EXCEEDED",
    "INVALID_PURPOSE",
    "CERT_UNTRUSTED",
    "CERT_REJECTED",
    "HOSTNAME_MISMATCH",
]);
function isRetryAllowed(error) {
    var _a;
    return !denyList.has((_a = error.code) !== null && _a !== void 0 ? _a : "");
}
exports.namespace = "axios-retry";
function isNetworkError(error) {
    return (!error.response &&
        Boolean(error.code) && // Prevents retrying cancelled requests
        error.code !== "ECONNABORTED" && // Prevents retrying timed out requests
        isRetryAllowed(error)); // Prevents retrying unsafe errors
}
const SAFE_HTTP_METHODS = ["get", "head", "options"];
const IDEMPOTENT_HTTP_METHODS = SAFE_HTTP_METHODS.concat(["put", "delete"]);
function isRetryableError(error) {
    return (error.code !== "ECONNABORTED" &&
        (!error.response ||
            (error.response.status >= 500 && error.response.status <= 599)));
}
function isIdempotentRequestError(error) {
    var _a;
    if (!error.config) {
        // Cannot determine if the request can be retried
        return false;
    }
    return (isRetryableError(error) &&
        IDEMPOTENT_HTTP_METHODS.indexOf((_a = error.config.method) !== null && _a !== void 0 ? _a : "") !== -1);
}
function isNetworkOrIdempotentRequestError(error) {
    return isNetworkError(error) || isIdempotentRequestError(error);
}
function exponentialDelay(retryNumber = 0) {
    const delay = Math.pow(2, retryNumber) * 100;
    const randomSum = delay * 0.2 * Math.random(); // 0-20% of the delay
    return delay + randomSum;
}
function getCurrentState(config) {
    const currentState = config[exports.namespace] || {};
    currentState.retryCount = currentState.retryCount || 0;
    config[exports.namespace] = currentState;
    return currentState;
}
function shouldRetry(retries, retryCondition, currentState, error) {
    return __awaiter(this, void 0, void 0, function* () {
        const shouldRetryOrPromise = currentState.retryCount < retries && retryCondition(error);
        // This could be a promise
        if (typeof shouldRetryOrPromise === "object") {
            try {
                const shouldRetryPromiseResult = yield shouldRetryOrPromise;
                // keep return true unless shouldRetryPromiseResult return false for compatibility
                return shouldRetryPromiseResult !== false;
            }
            catch (_err) {
                return false;
            }
        }
        return shouldRetryOrPromise;
    });
}
function applyRetryLogic(client, logger) {
    client.interceptors.request.use((config) => {
        const currentState = getCurrentState(config);
        currentState.lastRequestTime = Date.now();
        return config;
    });
    client.interceptors.response.use(null, (error) => __awaiter(this, void 0, void 0, function* () {
        const { config } = error;
        // If we have no information to retry the request
        if (!config) {
            return Promise.reject(error);
        }
        logger.error(error);
        const retryConfig = config;
        const { retries = 3, retryCondition = isNetworkOrIdempotentRequestError, retryDelay = exponentialDelay, shouldResetTimeout = false, onRetry = () => { }, } = retryConfig[exports.namespace];
        const currentState = getCurrentState(retryConfig);
        if (!(yield shouldRetry(retries, retryCondition, currentState, error))) {
            return Promise.reject(error);
        }
        currentState.retryCount += 1;
        const delay = retryDelay(currentState.retryCount);
        if (!shouldResetTimeout &&
            retryConfig.timeout &&
            currentState.lastRequestTime) {
            const lastRequestDuration = Date.now() - currentState.lastRequestTime;
            const timeout = retryConfig.timeout - lastRequestDuration - delay;
            if (timeout <= 0) {
                return Promise.reject(error);
            }
            retryConfig.timeout = timeout;
        }
        retryConfig.transformRequest = [(data) => data];
        onRetry(currentState.retryCount, error, retryConfig);
        return new Promise((resolve) => setTimeout(() => resolve(client(config)), delay));
    }));
}
exports.applyRetryLogic = applyRetryLogic;

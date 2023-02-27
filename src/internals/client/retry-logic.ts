/**
 *  Adapted Typescript version of the library axios-retry @link https://github.com/axios/axios-retry to avoid two new dependencies.
 */

import { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

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

function isRetryAllowed(error: AxiosError) {
  return !denyList.has(error.code ?? "");
}

export const namespace = "axios-retry";

function isNetworkError(error: AxiosError) {
  return (
    !error.response &&
    Boolean(error.code) && // Prevents retrying cancelled requests
    error.code !== "ECONNABORTED" && // Prevents retrying timed out requests
    isRetryAllowed(error)
  ); // Prevents retrying unsafe errors
}

const SAFE_HTTP_METHODS = ["get", "head", "options"];
const IDEMPOTENT_HTTP_METHODS = SAFE_HTTP_METHODS.concat(["put", "delete"]);

function isRetryableError(error: AxiosError) {
  return (
    error.code !== "ECONNABORTED" &&
    (!error.response ||
      (error.response.status >= 500 && error.response.status <= 599))
  );
}

function isIdempotentRequestError(error: AxiosError) {
  if (!error.config) {
    // Cannot determine if the request can be retried
    return false;
  }

  return (
    isRetryableError(error) &&
    IDEMPOTENT_HTTP_METHODS.indexOf(error.config.method ?? "") !== -1
  );
}

function isNetworkOrIdempotentRequestError(error: AxiosError) {
  return isNetworkError(error) || isIdempotentRequestError(error);
}

function exponentialDelay(retryNumber = 0) {
  const delay = Math.pow(2, retryNumber) * 100;
  const randomSum = delay * 0.2 * Math.random(); // 0-20% of the delay
  return delay + randomSum;
}

type RetryConfig = AxiosRequestConfig & {
  [namespace]: {
    retryCount: number;
    lastRequestTime: number;
    retries: number;
    retryCondition: (error: AxiosError) => boolean;
    retryDelay: () => number;
    shouldResetTimeout: boolean;
    onRetry: (
      retryCount: number,
      error: AxiosError,
      config: RetryConfig
    ) => void;
  };
};

function getCurrentState(config: RetryConfig) {
  const currentState = config[namespace] || {};
  currentState.retryCount = currentState.retryCount || 0;
  config[namespace] = currentState;
  return currentState;
}

async function shouldRetry(
  retries: number,
  retryCondition: (error: AxiosError) => boolean,
  currentState: { retryCount: number },
  error: AxiosError
) {
  const shouldRetryOrPromise =
    currentState.retryCount < retries && retryCondition(error);

  // This could be a promise
  if (typeof shouldRetryOrPromise === "object") {
    try {
      const shouldRetryPromiseResult = await shouldRetryOrPromise;
      // keep return true unless shouldRetryPromiseResult return false for compatibility
      return shouldRetryPromiseResult !== false;
    } catch (_err) {
      return false;
    }
  }
  return shouldRetryOrPromise;
}

export function applyRetryLogic(instance: AxiosInstance) {
  instance.interceptors.request.use((config) => {
    const currentState = getCurrentState(config as RetryConfig);
    currentState.lastRequestTime = Date.now();
    return config;
  });

  instance.interceptors.response.use(null, async (error: AxiosError) => {
    const { config } = error;

    // If we have no information to retry the request
    if (!config) {
      return Promise.reject(error);
    }

    const retryConfig = config as RetryConfig;

    const {
      retries = 3,
      retryCondition = isNetworkOrIdempotentRequestError,
      retryDelay = exponentialDelay,
      shouldResetTimeout = false,
      onRetry = () => {},
    } = retryConfig[namespace];

    const currentState = getCurrentState(retryConfig);

    if (!(await shouldRetry(retries, retryCondition, currentState, error))) {
      return Promise.reject(error);
    }

    currentState.retryCount += 1;

    const delay = retryDelay(currentState.retryCount);

    if (
      !shouldResetTimeout &&
      retryConfig.timeout &&
      currentState.lastRequestTime
    ) {
      const lastRequestDuration = Date.now() - currentState.lastRequestTime;
      const timeout = retryConfig.timeout - lastRequestDuration - delay;
      if (timeout <= 0) {
        return Promise.reject(error);
      }
      retryConfig.timeout = timeout;
    }

    retryConfig.transformRequest = [(data) => data];

    onRetry(currentState.retryCount, error, retryConfig);

    return new Promise((resolve) =>
      setTimeout(() => resolve(instance(config)), delay)
    );
  });
}

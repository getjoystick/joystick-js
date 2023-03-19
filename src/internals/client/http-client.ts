import axios, { AxiosInstance, AxiosResponse } from "axios";
import { applyRetryLogic } from "./retry-logic";
import { ILogger } from "../logger/i-logger";
import { ApiResponseError } from "../../models/api-response";
import { IHttpClient } from "./i-http-client";

const { JOYSTICK_TIMEOUT_IN_MS, JOYSTICK_BASE_URL } = process.env;

const baseUrl = JOYSTICK_BASE_URL || "https://api.getjoystick.com/api/v1";
const timeout = parseInt(JOYSTICK_TIMEOUT_IN_MS || "2500");

const ERRORS_REGEXP = new RegExp(/(\{.+}).$/);

export class HttpClient implements IHttpClient {
  private readonly _client: AxiosInstance;

  constructor(apiKey: string, private logger: ILogger) {
    this._client = axios.create({
      baseURL: baseUrl,
      timeout,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      responseEncoding: "UTF-8",
      responseType: "json",
    });

    this.checkResponseForErrors();

    applyRetryLogic(this._client, logger);
  }

  async post<ResponseType>(
    urlPath: string,
    payload: Record<string, unknown>,
    params?: Record<string, unknown>
  ): Promise<ResponseType> {
    this.logger.debug("Sending request to Joystick", {
      urlPath,
      payload,
      params,
    });

    const { data } = await this._client.post(urlPath, payload, {
      params,
    });

    return data;
  }

  private checkResponseForErrors() {
    this._client.interceptors.response.use(async (response: AxiosResponse) => {
      const { data } = response;

      const massagedData =
        typeof data === "string"
          ? data
          : Object.entries(data).reduce((acc, [key, value]) => {
              let massagedValue = value;

              if (typeof value === "string") {
                massagedValue = ERRORS_REGEXP.exec(value)?.[1];

                if (typeof massagedValue === "string") {
                  massagedValue = JSON.parse(massagedValue);

                  if (isApiResponseError(massagedValue)) {
                    massagedValue = massagedValue.errors;
                  }
                }
              }

              return {
                ...acc,
                [key]: massagedValue,
              };
            }, {});

      this.logger.debug(`{ data }`);

      return Promise.resolve({ ...response, data: massagedData });
    });
  }
}

function isApiResponseError(value: unknown): value is ApiResponseError {
  return (value as ApiResponseError)?.errors !== undefined;
}

import axios, { AxiosInstance, AxiosResponse } from "axios";
import { applyRetryLogic } from "./retry-logic";
import { ILogger } from "../logger/ILogger";

const { JOYSTICK_TIMEOUT_IN_MS, JOYSTICK_BASE_URL } = process.env;

const baseUrl = JOYSTICK_BASE_URL || "https://api.getjoystick.com/api/v1";
const timeout = parseInt(JOYSTICK_TIMEOUT_IN_MS || "2500");

const ERRORS_REGEXP = new RegExp(/(\{.+}).$/);

export class HttpClient {
  private readonly _client: AxiosInstance;
  private readonly _logger: ILogger;

  constructor(apiKey: string, logger: ILogger) {
    this._logger = logger;

    this._client = axios.create({
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

    applyRetryLogic(this._client, this._logger);
  }

  async post<ResponseType>(
    urlPath: string,
    payload: Record<string, any>,
    params?: Record<string, any>
  ): Promise<ResponseType> {
    this._logger.debug(
      { urlPath, payload, params },
      "Sending request to Joystick"
    );

    const { data } = await this._client.post(urlPath, payload, {
      params,
    });

    return data;
  }

  private checkResponseForErrors() {
    this._client.interceptors.response.use(async (response: AxiosResponse) => {
      const { data } = response;

      const massagedData = Object.entries(data).reduce((acc, [key, value]) => {
        let massagedValue = value;

        if (typeof value === "string") {
          massagedValue = ERRORS_REGEXP.exec(value)?.[1];

          if (typeof massagedValue === "string") {
            massagedValue = JSON.parse(massagedValue);
          }
        }

        return {
          ...acc,
          [key]: massagedValue,
        };
      }, {});

      this._logger.debug({ data });

      return Promise.resolve({ ...response, data: massagedData });
    });
  }
}

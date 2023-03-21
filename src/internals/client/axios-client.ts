import axios, { AxiosInstance, AxiosResponse } from "axios";
import { applyRetryLogic } from "./retry-logic";
import { Logger } from "../logger/logger";
import { ApiResponseError } from "../../models/api-response";
import { HttpClient } from "./http-client";

const ERRORS_REGEXP = new RegExp(/(\{.+}).$/);

export class AxiosClient implements HttpClient {
  private readonly client: AxiosInstance;
  private readonly logger: Logger;

  constructor({
    apiKey,
    timeoutInMs = 2_500,
    logger,
  }: {
    apiKey: string;
    timeoutInMs?: number;
    logger: Logger;
  }) {
    this.logger = logger;

    this.client = axios.create({
      timeout: timeoutInMs,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      responseEncoding: "UTF-8",
      responseType: "json",
    });

    this.checkResponseForErrors();

    applyRetryLogic(this.client, logger);
  }

  async put<ResponseType>(
    url: string,
    payload: Record<string, unknown>,
    params?: Record<string, unknown>
  ): Promise<ResponseType> {
    this.logger.debug("Sending put request", {
      url,
      payload,
      params,
    });

    const { data } = await this.client.put(url, payload, {
      params,
    });

    return data;
  }

  async post<ResponseType>(
    url: string,
    payload: Record<string, unknown>,
    params?: Record<string, unknown>
  ): Promise<ResponseType> {
    this.logger.debug("Sending post request", {
      url,
      payload,
      params,
    });

    const { data } = await this.client.post(url, payload, {
      params,
    });

    return data;
  }

  private checkResponseForErrors() {
    this.client.interceptors.response.use(async (response: AxiosResponse) => {
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

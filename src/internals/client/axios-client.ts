import axios, { AxiosError, AxiosInstance } from "axios";
import { Logger } from "../logger/logger";
import { HttpClient } from "./http-client";
import { ApiUnkownError } from "../../errors/api-unkown-error";
import { ApiServerError } from "../../errors/api-server-error";
import { ApiBadRequestError } from "../../errors/api-bad-request-error";

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
  }

  async put({
    url,
    payload,
    params,
  }: {
    url: string;
    payload: Record<string, unknown>;
    params?: Record<string, unknown>;
  }): Promise<void> {
    this.logger.debug("Sending put request", {
      url,
      payload,
      params,
    });

    try {
      await this.client.put(url, payload, {
        params,
      });
    } catch (e) {
      this.checkForErrors(e);

      throw e;
    }
  }

  async post({
    url,
    payload,
    params,
  }: {
    url: string;
    payload: Record<string, unknown>;
    params?: Record<string, unknown>;
  }): Promise<Record<string, unknown>> {
    this.logger.debug("Sending post request", {
      url,
      payload,
      params,
    });

    try {
      const { data } = await this.client.post(url, payload, {
        params,
      });

      return data;
    } catch (e) {
      this.checkForErrors(e);

      throw e;
    }
  }

  private checkForErrors(e: unknown) {
    if (!(e instanceof AxiosError && e.status)) {
      return;
    }

    if (e.status >= 400 && e.status < 500) {
      throw new ApiBadRequestError(e.message);
    }

    if (e.status >= 500) {
      throw new ApiServerError(e.message);
    }

    if (e.status != 200) {
      throw new ApiUnkownError(e.message);
    }
  }
}

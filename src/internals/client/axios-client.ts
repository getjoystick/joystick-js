import axios, { AxiosError, AxiosInstance } from "axios";
import { Logger } from "../logger/logger";
import { HttpClient } from "./http-client";
import { ApiUnkownError } from "../../errors/api-unkown-error";
import { ApiServerError } from "../../errors/api-server-error";
import { ApiBadRequestError } from "../../errors/api-bad-request-error";
import { InvalidArgumentError } from "../../errors/invalid-argument-error";

export class AxiosClient implements HttpClient {
  private readonly client: AxiosInstance;
  private readonly logger: Logger;

  constructor(apiKey: string, logger: Logger) {
    this.validateApiKey(apiKey);

    this.logger = logger;

    this.client = axios.create({
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      responseEncoding: "UTF-8",
      responseType: "json",
      validateStatus: (status: number) => status === 200,
    });
  }

  private validateApiKey(apiKey: string) {
    if (!apiKey || !apiKey.trim()) {
      throw new InvalidArgumentError(`Invalid apiKey: <${apiKey}>`);
    }
  }

  async put(
    url: string,
    payload: Record<string, unknown>,
    queryParams?: Record<string, unknown>
  ): Promise<void> {
    this.logger.debug("Sending put request", {
      url,
      payload,
      params: queryParams,
    });

    try {
      await this.client.put(url, payload, {
        params: queryParams,
      });
    } catch (e) {
      this.checkForErrors(e);

      throw e;
    }
  }

  async post(
    url: string,
    payload: Record<string, unknown>,
    queryParams?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    this.logger.debug("Sending post request", {
      url,
      payload,
      params: queryParams,
    });

    try {
      const { data } = await this.client.post(url, payload, {
        params: queryParams,
      });

      return data;
    } catch (e) {
      this.checkForErrors(e);

      throw e;
    }
  }

  private checkForErrors(e: unknown) {
    if (e instanceof AxiosError && e.response?.status) {
      const { status } = e.response;

      if (status >= 400 && status < 500) {
        throw new ApiBadRequestError(e.message);
      }

      if (status >= 500) {
        throw new ApiServerError(e.message);
      }

      if (status != 200) {
        throw new ApiUnkownError(e.message);
      }
    }
  }
}

import axios, { AxiosInstance } from "axios";
import { applyRetryLogic } from "./retry-logic";

const { JOYSTICK_TIMEOUT_MS, JOYSTICK_BASE_URL } = process.env;

const baseUrl = JOYSTICK_BASE_URL || "https://api.getjoystick.com/api/v1";
const timeout = parseInt(JOYSTICK_TIMEOUT_MS || "2_500");

export class HttpClient {
  private readonly _instance: AxiosInstance;

  constructor(apiKey: string) {
    this._instance = axios.create({
      baseURL: baseUrl,
      timeout: timeout,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      responseEncoding: "UTF-8",
      responseType: "json",
    });

    applyRetryLogic(this._instance);
  }

  async post<ResponseType>(
    urlPath: string,
    data: Record<string, any>,
    params?: Record<string, any>
  ): Promise<ResponseType> {
    const result = await this._instance.post(urlPath, data, {
      params,
    });

    return result.data;
  }
}

import axios, { AxiosInstance } from "axios";
import { ApiResponse } from "../models/api-response";

const { JOYSTICK_TIMEOUT_MS, JOYSTICK_BASE_URL } = process.env;

const baseUrl = JOYSTICK_BASE_URL || "https://api.getjoystick.com/api/v1";
const timeout = parseInt(JOYSTICK_TIMEOUT_MS || "2_500");

export class Client {
  private instance: AxiosInstance;

  constructor(apiKey: string) {
    this.instance = axios.create({
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
  }

  async post(
    urlPath: string,
    data: Record<string, any>,
    params?: Record<string, any>
  ): Promise<ApiResponse> {
    const result = await this.instance.post(urlPath, data, {
      params,
    });

    return result.data;
  }
}

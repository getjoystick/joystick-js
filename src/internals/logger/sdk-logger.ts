import { Logger } from "./logger";

/**
 * Logger implementation using console object
 *
 */
export class SdkLogger implements Logger {
  debug(...data: unknown[]): void {
    this.shouldLog("debug") && console.debug(...data);
  }

  error(...data: unknown[]): void {
    this.shouldLog("error") && console.error(...data);
  }

  info(...data: unknown[]): void {
    this.shouldLog("info") && console.info(...data);
  }

  warn(...data: unknown[]): void {
    this.shouldLog("warn") && console.warn(...data);
  }

  shouldLog(level: "info" | "error" | "warn" | "debug"): boolean {
    switch (level) {
      case "info":
      case "error":
      case "warn":
        return true;
      case "debug":
        return process.env.NODE_ENV === "development";
    }
  }
}

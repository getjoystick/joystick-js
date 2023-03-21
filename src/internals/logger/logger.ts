export interface Logger {
  info(...data: unknown[]): void;

  warn(...data: unknown[]): void;

  error(...data: unknown[]): void;

  debug(...data: unknown[]): void;

  shouldLog(level: "info" | "error" | "warn" | "debug"): boolean;
}

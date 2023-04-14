export interface Logger {
  info(...data: unknown[]): void;

  warn(...data: unknown[]): void;

  error(...data: unknown[]): void;

  debug(...data: unknown[]): void;

  /**
   * Indicates if the log should proceed based on the level type.
   */
  shouldLog(level: "info" | "error" | "warn" | "debug"): boolean;
}

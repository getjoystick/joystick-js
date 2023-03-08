export interface ILogger {
  info(message: string, ...optionalParams: any[]): void;

  warn(message: string, ...optionalParams: any[]): void;

  error(message?: any, ...optionalParams: any[]): void;

  debug(message?: any, ...optionalParams: any[]): void;
}

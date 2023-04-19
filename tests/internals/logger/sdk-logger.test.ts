import { SdkLogger } from "../../../src/internals/logger/sdk-logger";

describe("test SdkLogger", () => {
  it("info", () => {
    const logs: string[] = [];

    const info = jest.spyOn(console, "info").mockImplementation((message) => {
      logs.push(message);
    });

    const logger = new SdkLogger();

    logger.info("info test");

    expect(info).toHaveBeenCalled();

    expect(logs).toEqual(["info test"]);

    jest.spyOn(logger, "shouldLog").mockImplementation(() => false);

    logger.info("this should not be logged");

    expect(info).toHaveBeenCalledTimes(1);

    expect(logs).toEqual(["info test"]);

    info.mockRestore();
  });

  it("shouldLog", () => {
    const logger = new SdkLogger();

    expect(logger.shouldLog("info")).toEqual(true);
    expect(logger.shouldLog("warn")).toEqual(true);
    expect(logger.shouldLog("error")).toEqual(true);

    expect(logger.shouldLog("debug")).toEqual(false);

    process.env.NODE_ENV = "development";

    expect(logger.shouldLog("debug")).toEqual(true);

    jest.spyOn(logger, "shouldLog").mockImplementation(() => true);

    expect(logger.shouldLog("debug")).toEqual(true);
  });

  it("warn", () => {
    const logs: string[] = [];

    const warn = jest.spyOn(console, "warn").mockImplementation((message) => {
      logs.push(message);
    });

    const logger = new SdkLogger();

    logger.warn("warn test");

    expect(warn).toHaveBeenCalled();

    expect(logs).toEqual(["warn test"]);

    jest.spyOn(logger, "shouldLog").mockImplementation(() => false);

    logger.warn("this should not be logged");

    expect(warn).toHaveBeenCalledTimes(1);

    expect(logs).toEqual(["warn test"]);

    warn.mockRestore();
  });

  it("error", () => {
    const logs: string[] = [];

    const error = jest.spyOn(console, "error").mockImplementation((message) => {
      logs.push(message);
    });

    const logger = new SdkLogger();

    logger.error("error test");

    expect(error).toHaveBeenCalled();

    expect(logs).toEqual(["error test"]);

    jest.spyOn(logger, "shouldLog").mockImplementation(() => false);

    logger.error("this should not be logged");

    expect(error).toHaveBeenCalledTimes(1);

    expect(logs).toEqual(["error test"]);

    error.mockRestore();
  });

  it("debug", () => {
    const logs: string[] = [];

    const debug = jest.spyOn(console, "debug").mockImplementation((message) => {
      logs.push(message);
    });

    const logger = new SdkLogger();

    process.env.NODE_ENV = "something";

    logger.debug("should not be logged, because NODE_ENV is not development");

    expect(debug).toHaveBeenCalledTimes(0);

    expect(logs).toEqual([]);

    process.env.NODE_ENV = "development";

    logger.debug("now, it should be logged");

    expect(debug).toHaveBeenCalled();

    expect(logs).toEqual(["now, it should be logged"]);

    jest.spyOn(logger, "shouldLog").mockImplementation(() => false);

    logger.debug("this should not be logged");

    expect(debug).toHaveBeenCalledTimes(1);

    expect(logs).toEqual(["now, it should be logged"]);

    debug.mockRestore();
  });
});

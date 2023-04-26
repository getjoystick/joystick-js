# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2023-04-26

### Fixed

- README.md formatting
- Explicitly specify the branch for the GitHub Actions workflow badge

## [0.1.1] - 2023-04-24

### Added

- Source code with the implementation of `getContents` and `getContent`
- Flexible caching based on interface [SdkCache](./src/internals/cache/sdk-cache.ts)
- Custom HTTP client based on interface [HttpClient](./src/internals/client/http-client.ts)
- [Examples](./examples)
- Documentation [(README.md)](./README.md)
- [GitHub Actions pipeline](https://github.com/getjoystick/joystick-js/blob/main/.github/workflows/build.yaml) to Unit
  Testing at different NodeJS versions + different platforms

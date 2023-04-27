# Javascript Client for [Joystick Remote Config](https://www.getjoystick.com/)

[![Test code](https://github.com/getjoystick/joystick-js/actions/workflows/build.yaml/badge.svg?branch=main)](https://github.com/getjoystick/joystick-js/actions/workflows/build.yaml)
[![Latest Stable Version](https://img.shields.io/npm/v/@getjoystick/joystick-js)](https://www.npmjs.com/package/@getjoystick/joystick-js)
[![Total Downloads](https://img.shields.io/npm/dw/@getjoystick/joystick-js)](https://www.npmjs.com/package/@getjoystick/joystick-js)
[![License](https://img.shields.io/npm/l/@getjoystick/joystick-js)](https://www.npmjs.com/package/@getjoystick/joystick-js)

Streamline your app or game development process with Joystick's Javascript/Typescript JSON remote config platform. Easily manage and update configurations without codebase clutter or lengthy deployment processes. Our modern platform offers advanced workflow management, automated version control, and seamless integration with any Javascript or Typescript project. Plus, our native multi-environment support with permissions and review workflow ensures smooth operations your entire team will love.

Experience the benefits of simplified configuration management with Joystick. Try our @getjoystick/joystick-js library today to see how easy it is to my your app or game dynamic and fundamentally upgrade your team's workflow.

- [Full Developer Documentation](https://docs.getjoystick.com)
- [Joystick Remote Config](https://getjoystick.com)

## Installation

Requires NodeJS 16 and later. Install via [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-installer-to-install-nodejs-and-npm):

```bash
npm install @getjoystick/joystick-js
```

## Usage

Using Joystick to get remote configurations in your Javascript or Typescript project is a breeze.

```ts
// Import the package.
import { Joystick } from "@getjoystick/joystick-js";

// Initialize a client with a Joystick API Key
const joystickClient = new Joystick({
  apiKey: process.env.JOYSTICK_API_KEY,
});

(async () => {
  // Request a single configuration
  const contentId1 = await joystickClient.getContent("content-id1");

  // Request a single configuration (typescript)
  const contentId1Typed = await joystickClient.getContent<TypeForContentId1>(
    "content-id1"
  );

  // Request multiple configurations at the same time
  const configurations = await joystickClient.getContents([
    "content-id1",
    "content-id2",
  ]);
  console.log(configurations);

  // {
  //     "content-id1": {...},
  //     "content-id2": {...}
  // }
})();
```

### Specifying Additional Parameters

When creating the `Joystick` object, you can specify additional parameters which will be used by all API calls to the Joystick API. These additional parameters are used for AB Testing (`userId`), segmentation (`params`), and backward-compatible version delivery (`semVer`).

For more details see [API documentation](https://docs.getjoystick.com/api-reference/).

```ts
// Initializing a client with options
const joystickClient = new Joystick({
  apiKey: process.env.JOYSTICK_API_KEY,
  semVer: "0.0.1",
  userId: "user-id-1",
  params: {
    param1: "value1",
    param2: "value2",
  },
  options: {
    cacheExpirationSeconds: 600, // default 600 (10 mins)
    serialized: false, // default false
  },
});
```

### Additional Request Options

#### `fullResponse`

In most, you will just want the contents of your configuration. In advanced use cases where you want to process the AB testing or segmentation information, you can specify the `fullResponse` option to the client methods. The client will return you raw API response.

```ts
joystickClient
  .getContent("content-id1", { fullResponse: true })
  .then((getContentResponse) => console.log(getContentResponse));

// OR

joystickClient
  .getContents(["content-id1", "content-id2"], { fullResponse: true })
  .then((getContentsResponse) => console.log(getContentsResponse));
```

#### `serialized`

You can get the contents of your configuration serialized. When set as `true`, we will pass query parameter `responseType=serialized` to [Joystick API](https://docs.getjoystick.com/api-reference-combine/).

```ts
joystickClient
  .getContent("content-id1", { serialized: true })
  .then((getContentResponse) => console.log(getContentResponse));

// OR

joystickClient
  .getContents(["content-id1", "content-id2"], { serialized: true })
  .then((getContentsResponse) => console.log(getContentsResponse));
```

This option for a serialized response can be set globally for every API call by setting `setSerialized(true)` when initializing the client:

```ts
const joystickClient = new Joystick({
  apiKey: process.env.JOYSTICK_API_KEY,
  options: {
    serialized: true,
  },
});

// OR

joystickClient.setSerialized(true);
```

#### `refresh`

To ignore the existing cache when requesting a config – pass this option as `true`.

```ts
joystickClient
  .getContent("content-id1", { refresh: true })
  .then((getContentResponse) => console.log(getContentResponse));

// OR

joystickClient
  .getContents(["content-id1", "content-id2"], { refresh: true })
  .then((getContentsResponse) => console.log(getContentsResponse));
```

### Error handling

The client can raise different types of exceptions with the base class of `JoystickError`.

```ts
try {
  await joystickClient.getContents(["content-id1", "content-id2"]);
} catch (e) {
  if (e instanceof ApiHttpError) {
    // Handle HTTP error (i.e. timeout, or invalid HTTP code)
  } else if (e instanceof MultipleContentsApiException) {
    // Handle API exception (i.e. content is not found, or some of the keys can't be retrieved)
  }
}
```

### Caching

By default, the client uses [InMemoryCache](./src/internals/cache/in-memory-cache.ts), based on Map, which means the cache will be erased after application restart.

You can specify your own cache implementation by implementing the interface [SdkCache](./src/internals/cache/sdk-cache.ts).

See [`examples/typescript/node-cache`](./examples/typescript/src/node-cache) or [`examples/typescript/redis-cache`](./examples/typescript/src/redis-cache) for more details.

#### Clear the cache

If you want to clear the cache:

```ts
joystickClient.clearCache().then(() => console.log("Cache cleared!"));
```

### HTTP Client

You can provide a custom HTTP client, which may be useful for specifying a custom proxy or collecting detailed metrics about HTTP requests.

Change your HTTP client implementation by implementing the interface [HttpClient](./src/internals/client/http-client.ts).

See [`src/internals/client/axios-client`](./src/internals/client/axios-client.ts) for more details.

## Testing

To run unit tests, just run:

```bash
npm test
```

## Credits

- [Joystick](https://github.com/getjoystick)
- [All Contributors](graphs/contributors)

## License

The MIT. Please see [License File](LICENSE.md) for more information.

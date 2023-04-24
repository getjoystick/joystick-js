# Javascript Client for [Joystick Remote Config](https://www.getjoystick.com/)

[![GitHub Actions](https://github.com/getjoystick/joystick-js/actions/workflows/build.yaml/badge.svg)](https://github.com/getjoystick/joystick-js/actions?query=branch%3Amain)
[![Latest Stable Version](https://img.shields.io/npm/v/@getjoystick/joystick-js)](https://www.npmjs.com/package/@getjoystick/joystick-js)
[![Total Downloads](https://img.shields.io/npm/dw/@getjoystick/joystick-js)](https://www.npmjs.com/package/@getjoystick/joystick-js)
[![License](https://img.shields.io/npm/l/@getjoystick/joystick-js)](https://www.npmjs.com/package/@getjoystick/joystick-js)

Use Joystick to manage and use JSON remote configs easily with any Javascript/Typescript projects. Get configurations out of your code base. Update your configurations instantly without a long build, deploy process.

Joystick is a modern remote config platform built for to manage configurations effortless in one place, behind one API. We are natively multi-environment, have automated version control with advanced work-flow & permissions management, and much more. Your entire team will love us.

The @getjoystick/joystick-js library simplifies how your Javascript/Typescript project can communicate with the Joystick API to get remote configs over a REST API.

* [Full Developer Documentation](https://docs.getjoystick.com)
* [Joystick Remote Config](https://getjoystick.com)

## Installation

Requires NodeJS 16 and later. Install via [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-installer-to-install-nodejs-and-npm):

```bash
npm install @getjoystick/joystick-js
```

## Usage

Using Joystick to get remote configurations in your Javascript or Typescript project is a breeze.

```js
// Import the package.
import { Joystick } from "@getjoystick/joystick-js";

// Initialize a client with a Joystick API Key
const joystickClient = new Joystick({
  apiKey: process.env.JOYSTICK_API_KEY,
});

// Request a single configuration
joystickClient
  .getContent("content-id1")
  .then((getContentResponse) => console.log(getContentResponse.myProperty1));

// Request a single configuration
const contentId1 = await joystickClient.getContent("content-id1");

// Request a single configuration (typescript)
const contentId1 = await joystickClient.getContent<TypeForContentId1>("content-id1");

// Request multiple configurations at the same time
joystickClient
  .getContents(["content-id1", "content-id2"])
  .then((getContentsResponse) => {
    console.log(getContentsResponse["content-id1"].myProperty1);
    console.log(getContentsResponse["content-id2"].myProperty2);
  });

// Request multiple configurations at the same time
const configurations = await joystickClient.getContents(["content-id1", "content-id2"]);
console.log(configurations);

// {
//     "content-id1": {...},
//     "content-id2": {...}
// }

```


### Specifying Additional Parameters

When creating the `Joystick` object, you can specify additional parameters which will be used by all API calls to the Joystick API. These additional parameters are used for AB Testing (`userId`), segmentation (`params`), and backward-compatible version delivery (`semVer`).

For more details see [API documentation](https://docs.getjoystick.com/api-reference/).

```js
// Initializing a client with options
const joystickClient = new Joystick({
  apiKey: process.env.JOYSTICK_API_KEY,
  semVer: "0.0.1",
  userId: "user-id-1",
  params: {
    param1: "value1",
    param2: "value2"
  },
  options: {
    cacheExpirationSeconds: 600, // default 600 (10 mins)
    serialized: false // default false
  }
});
```

### Additional Request Options

#### `fullResponse`

In most, you will just want the contents of your configuration. In advanced use cases where you want to process the AB testing or segmentation information, you can specify the `fullResponse` option to the client methods. The client will return you raw API response.

```js
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

```js
joystickClient
  .getContent("content-id1", { serialized: true })
  .then((getContentResponse) => console.log(getContentResponse));

// OR

joystickClient
  .getContents(["content-id1", "content-id2"], { serialized: true })
  .then((getContentsResponse) => console.log(getContentsResponse));
```

This option for a serialized response can be set globally for every API call by setting `setSerialized(true)` when initializing the client:

```js
const joystickClient = new Joystick({
  apiKey: process.env.JOYSTICK_API_KEY,
  options: {
    serialized: true
  }
});

// OR 

joystickClient.setSerialized(true);
```

#### `refresh`

To ignore the existing cache when requesting a config – pass this option as `true`.

```js
joystickClient
  .getContent("content-id1", { refresh: true })
  .then((getContentResponse) => console.log(getContentResponse));

// OR

joystickClient
  .getContents(["content-id1", "content-id2"], { refresh: true })
  .then((getContentsResponse) => console.log(getContentsResponse));
```

### Caching

By default, the client uses [InMemoryCache](https://github.com/getjoystick/joystick-js/tree/main/src/internals/cache/in-memory-cache.ts), based on Map, which means the cache will be erased after application restart.

You can specify your own cache implementation by implementing the interface [SdkCache](https://github.com/getjoystick/joystick-js/tree/main/src/internals/cache/sdk-cache.ts).

See [`examples/typescript/node-cache`](https://github.com/getjoystick/joystick-js/tree/main/examples/typescript/src/node-cache) or [`examples/typescript/redis-cache`](https://github.com/getjoystick/joystick-js/tree/main/examples/typescript/src/redis-cache) for more details.

#### Clear the cache

If you want to clear the cache:

```js
joystickClient.clearCache().then(() => console.log("Cache cleared!"));
```

### HTTP Client

You can provide a custom HTTP client, which may be useful for specifying a custom proxy or collecting detailed metrics about HTTP requests.

Change your HTTP client implementation by implementing the interface [HttpClient](https://github.com/getjoystick/joystick-js/tree/main/src/internals/client/http-client.ts).

See [`src/internals/client/axios-client`](https://github.com/getjoystick/joystick-js/tree/main/src/internals/client/axios-client.ts) for more details.

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
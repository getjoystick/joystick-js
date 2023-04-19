# Javascript client for [Joystick](https://www.getjoystick.com/)

[![GitHub Actions](https://github.com/getjoystick/joystick-js/actions/workflows/build.yaml/badge.svg)](https://github.com/getjoystick/joystick-js/actions?query=branch%3Amain)
[![Latest Stable Version](https://img.shields.io/npm/v/@getjoystick/joystick-js)](https://www.npmjs.com/package/@getjoystick/joystick-js)
[![Total Downloads](https://img.shields.io/npm/dw/@getjoystick/joystick-js)](https://www.npmjs.com/package/@getjoystick/joystick-js)
[![License](https://img.shields.io/npm/l/@getjoystick/joystick-js)](https://www.npmjs.com/package/@getjoystick/joystick-js)

This is the library that simplifies the way how you can communicate with [Joystick API](https://docs.getjoystick.com/).

## Requirements

NodeJS 16 and later

## Installation

You can install the package
via [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-installer-to-install-nodejs-and-npm):

```bash
npm install @getjoystick/joystick-js
```

## Usage

To use the client, import the package.

```js
import { Joystick } from "@getjoystick/joystick-js";
```

Simple usage looks like this:

```js
const client = new Joystick({
  apiKey: process.env.JOYSTICK_API_KEY,
});

client
  .getContents(["content-id1", "content-id2"])
  .then((getContentsResponse) => {
    console.log(getContentsResponse["content-id1"].myProperty1);
    console.log(getContentsResponse["content-id2"].myProperty2);
  });
```

### Requesting Content by single Content Id

```js
client
  .getContent("content-id1")
  .then((getContentResponse) => console.log(getContentResponse.myProperty1));
```

### Specifying additional parameters:

When creating the `Joystick` object, you can specify additional parameters which will be used
by all API calls from the client, for more details see
[API documentation](https://docs.getjoystick.com/api-reference/):

```js
const client = new Joystick({
  apiKey: process.env.JOYSTICK_API_KEY,
  semVer: "0.0.1",
  userId: "user-id-1",
  params: {
    param1: "value1",
    param2: "value2"
  },
  options: {
    cacheExpirationSeconds: 600, // 10 mins
    serialized: true
  }
});
```

### Options

#### `fullResponse`

In most of the cases you will be not interested in the full response from the API, but if you're you can specify
`fullResponse` option to the client methods. The client will return you raw API response:

```js
client
  .getContent("content-id1", { fullResponse: true })
  .then((getContentResponse) => console.log(getContentResponse));
// OR
client
  .getContents(["content-id1", "content-id2"], { fullResponse: true })
  .then((getContentsResponse) => console.log(getContentsResponse));
```

#### `serialized`

When `true`, we will pass query parameter `responseType=serialized`
to [Joystick API](https://docs.getjoystick.com/api-reference-combine/).

```js
client
  .getContent("content-id1", { serialized: true })
  .then((getContentResponse) => console.log(getContentResponse));
// OR
client
  .getContents(["content-id1", "content-id2"], { serialized: true })
  .then((getContentsResponse) => console.log(getContentsResponse));
```

#### `refresh`

If you want to ignore existing cache and request the new config – pass this option as `true`.

```js
client
  .getContent("content-id1", { refresh: true })
  .then((getContentResponse) => console.log(getContentResponse));
// OR
client
  .getContents(["content-id1", "content-id2"], { refresh: true })
  .then((getContentsResponse) => console.log(getContentsResponse));
```

This option can be set for every API call from the client by setting `setSerialized(true)`:

```js
const client = new Joystick({
  apiKey: process.env.JOYSTICK_API_KEY,
  options: {
    serialized: true
  }
});
// OR 
client.setSerialized(true);
```

### Caching

By default, the client uses [InMemoryCache](./src/internals/cache/in-memory-cache.ts), based on Map,
which means the cache will be erased after application restart.

You can specify your cache implementation by implementing the interface [SdkCache](./src/internals/cache/sdk-cache.ts).

See [`examples/typescript/node-cache`](./examples/typescript/src/node-cache)
or [`examples/typescript/redis-cache`](./examples/typescript/src/redis-cache) for more details.

#### Clear the cache

If you want to clear the cache – run:

```js
client.clearCache().then(() => console.log("Cache cleared!"));
```

### HTTP Client

If you want to provide custom HTTP client, which may be useful for use-cases like specifying custom proxy,
collecting detailed metrics about HTTP requests,

You can your HTTP client implementation by implementing the
interface [HttpClient](./src/internals/client/http-client.ts).

See [`src/internals/client/axios-client`](./src/internals/client/axios-client.ts) for more details.

## Testing

To run unit tests, just run:

```bash
npm test
```

### Security

If you discover any security related issues, please email [letsgo@getjoystick.com](letsgo@getjoystick.com)
instead of using the issue tracker.

## Credits

- [Joystick](https://github.com/getjoystick)
- [All Contributors](graphs/contributors)

## License

The MIT. Please see [License File](LICENSE.md) for more information.

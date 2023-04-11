import * as dotenv from "dotenv";
import { Joystick } from "@getjoystick/joystick-js";
import { RedisCache } from "./redis-cache";

dotenv.config();

const cache = new RedisCache(2);
//const cache = new NodeCacheImpl(2);

const joystick = new Joystick(
  {
    apiKey: process.env.JOYSTICK_API_KEY || "",
    options: {
      cacheExpirationSeconds: 2,
    },
  },
  {
    cache,
  }
);
(async function () {
  let data = await joystick.getContent("first_config", {
    fullResponse: true,
  });

  console.log("from API", data);

  data = await joystick.getContent("first_config", {
    fullResponse: true,
  });

  console.log("from cache", data);

  await new Promise((f) => setTimeout(f, 3 * 1_000));

  data = await joystick.getContent("first_config", {
    fullResponse: true,
  });

  console.log("from API again", data);

  data = await joystick.getContent("first_config", {
    refresh: true,
  });

  console.log("from API again because refresh is true", data);

  await cache.disconnect();
})();

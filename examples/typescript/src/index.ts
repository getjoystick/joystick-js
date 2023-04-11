import * as dotenv from "dotenv";
import { NodeCacheImpl } from "./node-cache";
import { Joystick } from "@getjoystick/joystick-js";

dotenv.config();

const joystick = new Joystick({
  properties: {
    apiKey: process.env.JOYSTICK_API_KEY || "",
    options: {
      cacheExpirationSeconds: 2,
    },
  },
  cache: new NodeCacheImpl(2),
});

(async function () {
  let data = await joystick.getContent({
    contentId: "first_config",
    options: {
      fullResponse: true,
    },
  });

  console.log("from API", data);

  data = await joystick.getContent({
    contentId: "first_config",
    options: {
      fullResponse: true,
    },
  });

  console.log("from cache", data);

  await new Promise((f) => setTimeout(f, 3 * 1_000));

  data = await joystick.getContent({
    contentId: "first_config",
    options: {
      fullResponse: true,
    },
  });

  console.log("from API again", data);

  data = await joystick.getContent({
    contentId: "first_config",
    options: {
      refresh: true,
    },
  });

  console.log("from API again because refresh is true", data);
})();

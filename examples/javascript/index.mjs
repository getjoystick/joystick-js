import * as dotenv from "dotenv";
import { Joystick } from "@getjoystick/joystick-js";

dotenv.config();

const joystick = new Joystick({
  apiKey: process.env.JOYSTICK_API_KEY,
});

joystick
  .getContent("first_config", {
    fullResponse: true,
    serialized: true,
  })
  .then((r) => console.log(r));

joystick
  .publishContentUpdate("first_config", {
    description: "Second attempt",
    content: {
      name: "Miguel 2nd",
    },
  })
  .then((r) => console.log("Done"));

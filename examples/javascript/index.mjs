import * as dotenv from "dotenv";
import {Joystick} from "@getjoystick/joystick-js";

dotenv.config();

const joystick = new Joystick({
  properties: {
    apiKey: process.env.JOYSTICK_API_KEY
  }
});

joystick
  .getContent({
    contentId: "first_config", options: {
      fullResponse: true,
      serialized: true
    }
  })
  .then(r => console.log(r))

joystick
  .publishContentUpdate({
    contentId: "first_config",
    payload: {
      description: "Second attempt",
      content: {
        "name": "Miguel 2nd"
      }
    }
  })
  .then(r => console.log("Done"))

import {Joystick} from "@getjoystick/vanilla-js";
import * as dotenv from "dotenv";

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

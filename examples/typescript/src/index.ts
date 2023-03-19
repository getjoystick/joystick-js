import { Joystick } from "@getjoystick/vanilla-js";
import * as dotenv from "dotenv";

dotenv.config();

const joystick = new Joystick({
  apiKey: process.env.JOYSTICK_API_KEY || "",
});

(async function () {
  const data = await joystick.getContent("first_config");
  console.log(data);
})();

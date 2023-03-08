import {Joystick} from "@getjoystick/vanilla-js";
import * as dotenv from "dotenv";

dotenv.config();

const joystick = new Joystick({
  apiKey: process.env.JOYSTICK_API_KEY
});

joystick.getContent("first_config")
  .then(r => console.log(r))

import {Joystick} from "@getjoystick/vanilla-js";
import * as dotenv from "dotenv";

dotenv.config();

console.debug = console.log;

const joystick = new Joystick({
  apiKey: process.env.JOYSTICK_API_KEY
}, undefined, () => console);

joystick.getContent("first_config2")
  .then(r => console.log(r))

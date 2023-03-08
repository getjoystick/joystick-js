import { Joystick } from "@getjoystick/vanilla-js";

const joystick = new Joystick({
  apiKey: "3i6qPzyQLXznGDwq2OolfY1XtzQRh8ow",
});

(async function () {
  const data = await joystick.getContent("first_config");
  console.log(data);
})();

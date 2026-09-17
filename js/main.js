import { iniciarNavegacao } from "./navigation.js";
import { iniciarValidacao } from "./validation.js";

document.addEventListener("DOMContentLoaded", () => {
  iniciarValidacao();
  iniciarNavegacao();
});

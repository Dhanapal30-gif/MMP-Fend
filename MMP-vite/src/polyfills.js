// src/polyfills.js
import { Buffer } from "buffer";

if (typeof global === "undefined") {
  window.global = window;
}

if (typeof window.Buffer === "undefined") {
  window.Buffer = Buffer;
}

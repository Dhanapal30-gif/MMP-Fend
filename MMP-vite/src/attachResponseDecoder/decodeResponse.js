/**
 * Frontend: single axios response interceptor that decrypts every API
 * response's { payload } envelope back into normal JSON, before it reaches
 * any .then()/await call site. Attach it once, wherever your shared axios
 * instance is created (e.g. Services.js) — no changes needed per API call.
 *
 * Uses the browser's native Web Crypto API (window.crypto.subtle) for
 * AES-256-GCM — no npm dependency needed, and it matches the backend's
 * AES/GCM/NoPadding exactly (crypto-js does NOT support GCM, only CBC/CTR/
 * etc., so it can't be used here).
 *
 * ---- Services.js ----
 * If every call in this file already uses the plain, default `axios`
 * import (axios.post(...), axios.get(...), etc — as opposed to a separate
 * `axios.create({...})` instance), attach the decoder directly to that
 * default import ONCE, near the top of the file, right after the import.
 * Because axios's default export is a shared singleton, this decrypts
 * every existing call in the file with zero other changes:
 *
 *   import axios from 'axios';
 *   import { attachResponseDecoder } from './decodeResponse';
 *   attachResponseDecoder(axios);   // <-- add this one line
 *
 *   // everything below stays exactly as it was:
 *   export const LoginUser = (formData) => axios.post(Login_Api, formData);
 *   export const getProduct = () => axios.get(Get_Product);
 *   // ...
 *
 * This project keeps config in app.config.jsx (not a .env file), so the
 * secret is read from there instead of import.meta.env — add:
 *   export const responseSecret = 'PASTE_THE_SAME_SECRET_AS_THE_BACKEND_HERE';
 * to app.config.jsx, right next to the existing `url` export.
 *
 * PRODUCTION NOTE: there is no fallback default secret here on purpose.
 * If responseSecret is missing, every response fails to decrypt and
 * errors loudly in the console — that's intentional, so a misconfiguration
 * is caught immediately instead of silently leaving data unreadable or
 * (worse) falling back to some guessable default.
 *
 * NOTE ON SECURITY: any secret placed in frontend code ships inside the
 * JS bundle and is readable by anyone who opens devtools — so this scheme
 * *obscures* response payloads from casual inspection of the Network tab,
 * it does not make them cryptographically secure against a determined
 * client-side attacker who decompiles the bundle. Don't rely on it to hide
 * data the user genuinely shouldn't be able to see — that must be enforced
 * server-side by simply not sending it.
 */

import { responseSecret } from '../app.config'; // adjust relative path to match where app.config.jsx actually lives

const SECRET = responseSecret;

if (!SECRET) {
  // Loud and immediate, matching the backend's fail-fast behavior.
  console.error(
    'decodeResponse: responseSecret is not set in app.config.jsx. ' +
    'All encrypted API responses will fail to decrypt until this is fixed.'
  );
}

function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derives the AES-256 key once (SHA-256 of the secret, same as the backend)
// and caches the resulting CryptoKey for reuse across every request.
let keyPromise = null;
function getKey() {
  if (!keyPromise) {
    keyPromise = (async () => {
      const encoder = new TextEncoder();
      const secretBytes = encoder.encode(SECRET || '');
      const hash = await window.crypto.subtle.digest('SHA-256', secretBytes);
      return window.crypto.subtle.importKey(
        'raw',
        hash,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
    })();
  }
  return keyPromise;
}

async function decryptPayload(payload) {
  const [ivB64, cipherB64] = payload.split(':');
  const iv = base64ToBytes(ivB64);
  const ciphertext = base64ToBytes(cipherB64); // includes the GCM auth tag, same as the backend produces

  const key = await getKey();

  const plaintextBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(plaintextBuffer);
}

// Decrypts response.data.payload IN PLACE if present. Used for both the
// success path and the error path below — the backend encrypts JSON error
// bodies (your own @ExceptionHandler responses, and Spring Boot's default
// error controller for an unhandled 500) exactly the same way it encrypts
// success bodies, so both need decrypting the same way.
async function decryptResponseInPlace(response) {
  const body = response?.data;

  if (body && typeof body.payload === 'string') {
    const jsonString = await decryptPayload(body.payload);
    response.data = JSON.parse(jsonString);
  }
}

export function attachResponseDecoder(axiosInstance) {
  axiosInstance.interceptors.response.use(

    // ============ SUCCESS PATH (2xx) ============
    async (response) => {
      try {
        await decryptResponseInPlace(response);
      } catch (err) {
        // GCM decryption throws (rather than silently returning garbage)
        // if the secret is wrong or the payload was tampered with — that
        // integrity check is the whole point of GCM over plain CBC.
        console.error('decodeResponse: failed to decrypt response payload', err);
        throw err; // fail closed — don't hand callers an undecrypted envelope as if it were data
      }
      return response;
    },

    // ============ ERROR PATH (4xx / 5xx / network errors) ============
    // axios routes any non-2xx status here instead of the success handler
    // above, so without this, every error body (validation errors, login
    // conflicts, unhandled 500s) would reach .catch() blocks still encrypted.
    async (error) => {
      if (error.response) {
        try {
          await decryptResponseInPlace(error.response);
        } catch (decryptErr) {
          // Don't let a decryption failure hide the original HTTP error —
          // log it and still reject with the original error. Whatever code
          // reads error.response.data.message will just see the encrypted
          // envelope in this case, but the request's failure is still
          // correctly surfaced as a rejection.
          console.error('decodeResponse: failed to decrypt error response payload', decryptErr);
        }
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
}
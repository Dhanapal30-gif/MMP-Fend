// Standalone test — verifies backend/frontend AES compatibility in isolation.
// Usage:
//   npm install crypto-js
//   node test-decode.js "<your-real-secret>" "<payload-string-from-Network-tab>"

const CryptoJS = require('crypto-js');

const SECRET = process.argv[2];
const PAYLOAD = process.argv[3];

if (!SECRET || !PAYLOAD) {
  console.log('Usage: node test-decode.js "<secret>" "<payload>"');
  process.exit(1);
}

const KEY = CryptoJS.SHA256(SECRET);
const [ivB64, cipherB64] = PAYLOAD.split(':');
const iv = CryptoJS.enc.Base64.parse(ivB64);

try {
  const decrypted = CryptoJS.AES.decrypt(cipherB64, KEY, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  const text = decrypted.toString(CryptoJS.enc.Utf8);

  if (!text) {
    console.log('FAILED: decrypted to empty string — secret is almost certainly wrong.');
  } else {
    console.log('SUCCESS:');
    console.log(text);
  }
} catch (err) {
  console.log('FAILED with error (usually means wrong secret / corrupted payload):', err.message);
}

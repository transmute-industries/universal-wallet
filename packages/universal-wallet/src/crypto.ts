import { Crypto } from "@peculiar/webcrypto";

function isNodejs() {
  return (
    typeof process === "object" &&
    typeof process.versions === "object" &&
    typeof process.versions.node !== "undefined"
  );
}

function isReactNative() {
  return (
    typeof navigator !== 'undefined' && 
    navigator.product === 'ReactNative'
  );
}

let crypto: Crypto;

if (isNodejs() || isReactNative()) {
  crypto = new Crypto();
} else {
  crypto = window.crypto;
}

export default crypto;

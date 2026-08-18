import { compress, decompress } from "./docs/compress.js";
import {
  outputAlphabetASCII,
  outputAlphabetQR,
  outputAlphabetEmoji
} from "./docs/alphabets.js";

const input = process.argv[2]?.trim();
const alphabetName = process.argv[3]?.trim() || "ascii";
const command = process.argv[4]?.trim() || "encode";
if (!input) {
  console.error(`Usage: hamr <link> [ascii|qr|emoji] {decode|encode}`);
  console.error(`The final argument is optional and defaults to "encode".`);
  process.exit(1);
}

let payload = "";
if (input.toLowerCase().startsWith("http://ha.mr")) {
  payload = input.slice(12);
} else if (input.toLowerCase().startsWith("https://ha.mr")) {
  payload = input.slice(13);
} else if (input.toLowerCase().startsWith("ha.mr")) {
  payload = input.slice(5);
} else if (command === "decode") {
  const pos = input.indexOf("#");
  payload = input.slice(pos);
  console.log(`Payload: ${payload}`);
}

if (payload || command === "decode") {
  const isQRCode = payload.startsWith("/");
  payload = payload.slice(1);
  const useEmoji = Array.from(payload).some(c => !outputAlphabetASCII.includes(c));
  if (isQRCode) console.log(decompress(payload, outputAlphabetQR));
  else console.log(decompress(payload, useEmoji ? outputAlphabetEmoji : outputAlphabetASCII));
  process.exit(0);
}

let alphabet = outputAlphabetASCII;
if (alphabetName === "qr") alphabet = outputAlphabetQR;
else if (alphabetName === "emoji") alphabet = outputAlphabetEmoji;
else if (alphabetName !== "ascii") {
  console.error(`Unknown alphabet "${alphabetName}".`);
  console.error("Select one of: ascii, qr, emoji");
  process.exit(2);
}

if (alphabetName === "qr") {
  console.log("HTTP://HA.MR/" + compress(input, alphabet));
} else {
  console.log("http://ha.mr#" + compress(input, alphabet));
}

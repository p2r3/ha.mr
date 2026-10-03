import { compress, decompress } from './docs/compress.js';
import { outputAlphabetASCII, outputAlphabetQR, outputAlphabetEmoji } from './docs/alphabets.js';

const input = process.argv[2]?.trim();
const alphabetName = process.argv[3]?.trim() || 'ascii';
const command = process.argv[4]?.trim() || 'encode';

if (!input) {
    console.error("Usage: hamr <link> [ascii|qr|emoji] {decode|encode}");
    console.error("The final argument is optional and defaults to encode.");
    process.exit(1);
}

let alphabet = outputAlphabetASCII;
if (alphabetName === 'qr') alphabet = outputAlphabetQR;
else if (alphabetName === 'emoji') alphabet = outputAlphabetEmoji;
else if (alphabetName !== 'ascii') {
    console.error(`Unknown alphabet ${alphabetName}.`);
    console.error("Select one of: ascii, qr, emoji");
    process.exit(2);
}

if (command === 'decode' || input.toLowerCase().includes('ha.mr')) {
    let payload = '';
    let isQRCode = false;

    if (input.toLowerCase().includes('ha.mr')) {
        try {
            const urlString = input.toLowerCase().startsWith('http') ? input : `http://${input}`;
            const parsedUrl = new URL(urlString);
            
            if (parsedUrl.pathname && parsedUrl.pathname !== '/') {
                payload = parsedUrl.pathname.slice(1);
                isQRCode = true;
            } else if (parsedUrl.hash) {
                payload = parsedUrl.hash.slice(1);
            }
        } catch (e) {
            console.error("Invalid URL format provided.");
            process.exit(3);
        }
    } else {
        payload = input.startsWith('#') || input.startsWith('/') ? input.slice(1) : input;
        isQRCode = input.startsWith('/');
    }

    if (!payload) {
        console.error("No valid encoded payload found to decode.");
        process.exit(3);
    }

    console.log(`Payload: ${payload}`);

    const useEmoji = Array.from(payload).some(c => !outputAlphabetASCII.includes(c));

    if (isQRCode) {
        console.log(decompress(payload, outputAlphabetQR));
    } else {
        console.log(decompress(payload, useEmoji ? outputAlphabetEmoji : outputAlphabetASCII));
    }
    process.exit(0);
}

if (alphabetName === 'qr') {
    console.log("HTTP://HA.MR/" + compress(input, alphabet));
} else {
    console.log("http://ha.mr#" + compress(input, alphabet));
}

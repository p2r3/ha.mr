import { compress, decompress } from "./compress.js";
import {
  outputAlphabetASCII,
  outputAlphabetQR,
  outputAlphabetEmoji
} from "./alphabets.js";

let qrGenerate, qrMode, qrCorrection;

let domain = window.location.hostname;
if (domain !== "ha.mr" && domain !== "www.ha.mr") {
  console.log(`This page is intended to be used on the ha.mr domain. You are currently on ${domain}.`);
}
const webPort = window.location.port;
if (webPort && webPort !== "80" && webPort !== "443") {
  domain += `:${webPort}`;
}

var settings = {
  emoji: false,
  qr: false
};

const settingsElements = {
  emoji: "#settings-emoji",
  qr: "#settings-qr"
};

for (const setting in settingsElements) {
  const element = document.querySelector(settingsElements[setting]);
  settings[setting] = element.checked;
  element.addEventListener("change", (event) => {
    settings[setting] = element.checked;
    updateOutput();
  });
}

function countSymbols (string, alphabet) {
  let count = 0;
  while (string) {
    const symbol = alphabet.find(c => string.endsWith(c));
    string = string.slice(0, symbol ? -symbol.length : -1);
    count ++;
  }
  return count;
}

const inputLinkElement = document.querySelector("#input-link");
const outputLinkElement = document.querySelector("#output-link");
const outputRatioElement = document.querySelector("#output-ratio");
const queryWarningElement = document.querySelector("#query-warning");

const qrCodeImage = document.querySelector("#qrcode");
const qrCodeCorrectionLevelContainer = document.querySelector("#qr-correct-level-container");
const qrCodeCorrectionLevelElement = document.querySelector("#qr-correct-level");

qrCodeCorrectionLevelElement.addEventListener("input", () => {
  updateOutput();
});

function updateOutput () {
  const input = inputLinkElement.value.trim();
  try {
    const alphabet = settings.emoji ? outputAlphabetEmoji : outputAlphabetASCII;
    const output = compress(input, alphabet);

    // compress.js does not have support for non-http(s) protocols, nor credentials.
    // previously it would silently strip them, but this block makes it reject instead
    // additionally, invalid inputs the compressor would otherwise accept (like "http://") are rejected as well

    // Regex: one or more word [a-zA-Z0-9_] characters, followed by ://. 
    // Underscore is not valid but will get rejected by new URL() anyway
    const hasProtocol = input.match(/\w+:\/\//); 
    const url = new URL(hasProtocol ? input : "http://" + input);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error(`Invalid protocol: ${url.protocol}. Only http and https are supported.`);
    }

    if (url.username || url.password) {
      throw new Error(`Credentials in URL are not supported`);
    }

    let inputNormalized = input;
    const inputLower = input.toLowerCase();
    if (inputLower.startsWith("https://")) {
      inputNormalized = input.slice(8);
    } else if (inputLower.startsWith("http://")) {
      inputNormalized = input.slice(7);
    }
    let excessiveParams = false;
    if (URL.canParse("http://" + inputNormalized)) {
      const url = new URL("http://" + inputNormalized);
      if (url.searchParams.size > 1) {
        excessiveParams = true;
      }
    }
    if (excessiveParams) {
      queryWarningElement.style.display = "inline";
    } else {
      queryWarningElement.style.display = "none";
    }
    const ratio = (1 - (countSymbols(output, alphabet) + 6) / inputNormalized.length) * 100;
    if (ratio < -300) {
      outputRatioElement.textContent = `Output is much larger than the input`;
      outputRatioElement.style.color = "rgb(255, 50, 50)";
    } else if (ratio < 0) {
      outputRatioElement.textContent = `Output is ${Math.floor(-ratio)}% larger than the input`;
      outputRatioElement.style.color = "rgb(255, 50, 50)";
    } else if (ratio > 0) {
      outputRatioElement.textContent = `Output is ${Math.ceil(ratio)}% smaller than the input`;
      outputRatioElement.style.color = "rgb(15, 190, 15)";
    } else {
      outputRatioElement.textContent = "Output is the same length as the input";
      outputRatioElement.style.color = "gray";
    }
    outputLinkElement.textContent = `http://${domain}#${output}`;
    outputLinkElement.href = `http://${domain}#${output}`;
    outputLinkElement.style.color = "";
    if (settings.qr) {
      // Lazyload the qr generator to avoid loading it on a redirect
      if (!qrGenerate) {
        import("./lean-qr/lean-qr.js").then((module) => {
          qrGenerate = module.generate;
          qrMode = module.mode;
          qrCorrection = module.correction;
          updateOutput();
        });
        return;
      }

      const correctionLevels = [qrCorrection.L, qrCorrection.M, qrCorrection.Q, qrCorrection.H];

      qrCodeImage.style.display = "inline";
      qrCodeCorrectionLevelContainer.style.display = "inline";

      const qrCodeDomain = domain.toUpperCase();
      const qrCodeLink = `HTTP://${qrCodeDomain}/${compress(input, outputAlphabetQR)}`;

      const errorCorrection = correctionLevels[qrCodeCorrectionLevelElement.value];

      const qr = qrGenerate(
        qrMode.alphaNumeric(qrCodeLink),
        {
          minVersion: 1,
          maxVersion: 40,
          minCorrectionLevel: errorCorrection,
          // Lean-qr will choose the highest ECC that will fit in the smallest version, between minCorrectionLevel and maxCorrectionLevel
          maxCorrectionLevel: qrCorrection.H,
        });

      qr.toCanvas(qrCodeImage,
        {
          on:  [0x00, 0x00, 0x00, 0xFF], // black
          off: [0xFF, 0xFF, 0xFF, 0xFF], // white
          pad: 2,
        }
      );
      // Set image width to qr version size + 4px per side padding, scale by 8
      // Otherwise the output will be at 1px scale and impossible to see.
      qrCodeImage.style.width = `${(qr.size + 8) * 8}px`;
      qrCodeImage.style.height = `${(qr.size + 8) * 8}px`;
      qrCodeImage.title = qrCodeLink;

    } else {
      qrCodeImage.style.display = "none";
      qrCodeCorrectionLevelContainer.style.display = "none";
    }
  } catch (e) {
    if (!input.trim()) {
      outputLinkElement.textContent = "Enter a link above to compress";
    } else {
      outputLinkElement.textContent = "Invalid link";
      outputLinkElement.style.color = "rgb(255, 50, 50)";
      console.error(e);
    }
    qrCodeImage.style.display = "none";
    qrCodeCorrectionLevelContainer.style.display = "none";
    outputRatioElement.style.color = "rgba(255, 255, 255, 0)";
    outputLinkElement.removeAttribute("href");
    queryWarningElement.style.display = "none";
  }
}

const redirectContainerElement = document.querySelector("#redirect-container");
const redirectLinkElement = document.querySelector("#redirect-link");
const loaderElement = document.querySelector("#loader");

function handleRedirectPrompt (target) {
  loaderElement.style.display = "none";
  redirectContainerElement.style.display = "flex";
  redirectLinkElement.textContent = target;
  redirectLinkElement.href = target;
}

inputLinkElement.addEventListener("input", () => {
  updateOutput();
});

(() => {
  let payload = null;
  let alphabet = outputAlphabetASCII;

  // Get hash value of current address bar
  if (window.location.hash) {
    // Decode hash value in case it's non-ASCII
    payload = decodeURIComponent(window.location.hash.slice(1));
    // Remove all whitespace - we never use whitespace when encoding hash values
    payload = payload.replaceAll(" ", "");
    // Check if input is pure ASCII - potentially unreliable?
    const useEmoji = Array.from(payload).some(c => !outputAlphabetASCII.includes(c));
    alphabet = useEmoji ? outputAlphabetEmoji : outputAlphabetASCII;
  } else {
    // If no hash value, we're likely reading a QR code
    // For that, use the path instead
    payload = decodeURIComponent(window.location.pathname.slice(1));
    alphabet = outputAlphabetQR;
  }

  if (payload && payload.trim()) {
    try {
      const target = decompress(payload, alphabet);
      handleRedirectPrompt(target);
      return;
    } catch (e) {
      console.warn(`Redirect failed. Could not decode input.`);
      console.error(e);
    }
  }

  updateOutput();

  loaderElement.style.opacity = 0;
  document.querySelector("#content").style.opacity = 1;
  document.querySelector("#content").style.pointerEvents = "auto";
  document.querySelector("header").style.opacity = 1;
  document.querySelector("header").style.pointerEvents = "auto";

})();

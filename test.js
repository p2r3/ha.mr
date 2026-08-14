import { compress, decompress } from "./compress.js";
import { outputAlphabetASCII, outputAlphabetQR, outputAlphabetEmoji } from "./alphabets.js";

const testUrls = [
  "https://www.nytimes.com/games/wordle/index.html",
  "https://google.com",
  "http://example.com",
  "http://localhost:8080/api/v1/users",
  "https://en.m.wikipedia.org/wiki/Lossless_compression",
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s",
  "https://example.com/search?q=test&category=books&page=2",
  "https://github.com/p2r3/ha.mr#acknowledgements",
  "https://www.bbc.co.uk/news/world",
  "https://amazon.com/dp/B08N5WRWNW?tag=affiliate-20",
  "https://twitter.com/jack/status/20",
  "https://ha.mr",
  "https://news.ycombinator.com/item?id=12345678",
  "https://sub.domain.co.uk/path/to/page?query=val&other=1#heading",
  "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  "https://stackoverflow.com/questions/11227809/why-is-processing-a-sorted-array-faster-than-processing-an-unsorted-array",
  "http://httpbin.org/get?param1=hello%20world&param2=12345",
  "https://enterprise.covai.org"
];

function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.href.replace(/\/$/, "");
  } catch {
    return url;
  }
}

console.log(`[1/2] Running round-trip test on ${testUrls.length} URLs across ASCII, QR, and Emoji...\n`);

let passed = 0;
let failed = 0;

for (const url of testUrls) {
  let testFailed = false;

  for (const [name, alphabet] of [
    ["ASCII", outputAlphabetASCII],
    ["QR", outputAlphabetQR],
    ["Emoji", outputAlphabetEmoji]
  ]) {
    try {
      const compressed = compress(url, alphabet);
      const decompressed = decompress(compressed, alphabet);
      
      const matches = decompressed === url || normalizeUrl(decompressed) === normalizeUrl(url);
      if (!matches) {
        console.error(`❌ [${name}] Mismatch for: ${url}`);
        console.error(`   Output payload: ${compressed}`);
        console.error(`   Decompressed  : ${decompressed}`);
        testFailed = true;
      }
    } catch (err) {
      console.error(`❌ [${name}] Error on: ${url}`);
      console.error(`   ${err.stack || err}`);
      testFailed = true;
    }
  }

  if (testFailed) {
    failed++;
  } else {
    passed++;
  }
}

console.log(`Roundtrip results: ${passed} passed, ${failed} failed (${testUrls.length} total)\n`);

// Backwards compatibility tests with pre-computed Version 0 payloads
console.log(`[2/2] Running backwards compatibility verification on Version 0 payloads...`);
const v0TestCases = [
  {
    payload: "CRa2cek=!Toa[&",
    alphabet: outputAlphabetASCII,
    expected: "https://www.nytimes.com/games/wordle/index.html"
  },
  {
    payload: "OM(",
    alphabet: outputAlphabetASCII,
    expected: "https://google.com"
  },
  {
    payload: ".Uk6",
    alphabet: outputAlphabetASCII,
    expected: "http://example.com"
  },
  {
    payload: "v7EbpdaJM(46.[L)EUxhK3DA,S!",
    alphabet: outputAlphabetASCII,
    expected: "https://github.com/p2r3/ha.mr#acknowledgements"
  }
];

let v0Passed = 0;
let v0Failed = 0;

for (const { payload, alphabet, expected } of v0TestCases) {
  try {
    const result = decompress(payload, alphabet);
    if (result === expected || normalizeUrl(result) === normalizeUrl(expected)) {
      v0Passed++;
    } else {
      console.error(`❌ V0 mismatch: expected "${expected}", got "${result}"`);
      v0Failed++;
    }
  } catch (err) {
    console.error(`❌ V0 decode error: ${err}`);
    v0Failed++;
  }
}

console.log(`V0 Compatibility results: ${v0Passed} passed, ${v0Failed} failed\n`);

if (failed > 0 || v0Failed > 0) {
  console.error("Test suite FAILED!");
  process.exit(1);
} else {
  console.log("✅ ALL TEST SUITES PASSED SUCCESSFULLY!");
}

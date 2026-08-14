import { compress, decompress } from "./compress.js";
import { outputAlphabetASCII, outputAlphabetQR, outputAlphabetEmoji } from "./alphabets.js";

const testUrls = [
  // Standard Web URLs
  "https://www.nytimes.com/games/wordle/index.html",
  "https://google.com/",
  "https://google.com",
  "http://example.com/",
  "http://localhost:8080/api/v1/users",
  "https://en.m.wikipedia.org/wiki/Lossless_compression",
  "https://reddit.com/r/programming/comments/xyz123/great_tool/",
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s",
  "https://example.com/search?q=test&category=books&page=2",
  "https://github.com/p2r3/ha.mr#acknowledgements",
  "https://mysite.org/forum/index.php?topic=123",
  "https://mysite.org/index.html?ref=twitter#top",
  "https://example.com/path-with_special~chars/test.html",
  "https://en.wikipedia.org/wiki/Caf%C3%A9",
  "https://www.bbc.co.uk/news/world",
  "https://amazon.com/dp/B08N5WRWNW?tag=affiliate-20",
  "https://twitter.com/jack/status/20",
  "https://ha.mr",
  "https://news.ycombinator.com/item?id=12345678",
  "https://sub.domain.co.uk/path/to/page?query=val&other=1#heading",
  "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  "https://stackoverflow.com/questions/11227809/why-is-processing-a-sorted-array-faster-than-processing-an-unsorted-array",
  "http://httpbin.org/get?param1=hello%20world&param2=12345",
  "https://www.deadrat.in/posts/protecting-the-commons-from-the-machines/",
  "https://enterprise.covai.org/",
  "https://ta.wikipedia.org/wiki/%E0%AE%95%E0%AF%82%E0%AE%B4%E0%AF%88%E0%AE%95%E0%AF%8D%E0%AE%95%E0%AE%9F%E0%AE%BE",

  // Generic and Custom App URIs
  "magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny",
  "obsidian://open?vault=Notes&file=Projects%2FPlan",
  "vscode://file/home/user/project/main.js:42:10",
  "cursor://file/home/user/code/index.js:10:5",
  "notion://www.notion.so/my-workspace/page-id-12345",
  "figma://file/abc123XYZ/My-Design-System",
  "linear://workspace/issue/ENG-1234",
  "mailto:user@example.com?subject=Hello%20World&body=Test",
  "tel:+1234567890",
  "spotify:track:4cOdK2wGLETKBW3PvgPWqT",
  "tg://resolve?domain=telegram",
  "whatsapp://send?phone=1234567890&text=Hello",
  "signal://send?phone=+1234567890",
  "discord://discord.com/channels/123/456",
  "slack://channel?team=T12345&id=C12345",
  "msteams://teams.microsoft.com/l/meetup-join/19%3Ameeting_abc",
  "zoommtg://zoom.us/join?confno=123456789&pwd=secret",
  "irc://irc.libera.chat:6697/ha.mr",
  "steam://run/440",
  "bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.001",
  "lightning:LNURL1DP68GURN8GHJ7MRW9E3XJUM5WGH8JMMWDAJ8GET9DP68GURN8GHJ7VF3XSEKJD3H89UXS6T8",
  "ethereum:0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe?value=1e18",
  "gemini://geminispace.info/",
  "torrent:?xt=urn:btih:1234567890abcdef",
  "webcal://example.com/calendar.ics",
  "geo:37.7749,-122.4194?z=15",
  "file:///home/user/documents/report.pdf",
  "wifi:S:MyNetwork;T:WPA;P:SecretPassword;;",
  "custom-app://action?param=123#frag"
];

function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.href.replace(/%[0-9a-f]{2}/gi, match => match.toUpperCase());
  } catch {
    return url.replace(/%[0-9a-f]{2}/gi, match => match.toUpperCase());
  }
}

console.log(`[1/3] Running round-trip test on ${testUrls.length} URIs across ASCII, QR, and Emoji...\n`);

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

// Security Gatekeeper Verification
console.log(`[2/3] Running Security Gatekeeper verification on unsafe URI schemes...`);
const unsafeSchemes = [
  "javascript:alert(1)",
  "JAVASCRIPT:console.log('pwned')",
  "data:text/html,<script>alert(1)</script>",
  "vbscript:msgbox('hello')",
  "blob:https://example.com/uuid"
];

let securityPassed = 0;
let securityFailed = 0;

for (const unsafeUri of unsafeSchemes) {
  let blocked = false;
  try {
    compress(unsafeUri, outputAlphabetASCII);
  } catch (err) {
    if (err.message && err.message.includes("unsafe")) {
      blocked = true;
    }
  }

  if (blocked) {
    securityPassed++;
  } else {
    console.error(`❌ Security gatekeeper failed to block unsafe scheme: ${unsafeUri}`);
    securityFailed++;
  }
}
console.log(`Security results: ${securityPassed} passed, ${securityFailed} failed (${unsafeSchemes.length} total)\n`);

// Backwards compatibility tests with pre-computed Version 0 payloads
console.log(`[3/3] Running backwards compatibility verification on Version 0 payloads...`);
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

if (failed > 0 || securityFailed > 0 || v0Failed > 0) {
  console.error("Test suite FAILED!");
  process.exit(1);
} else {
  console.log("✅ ALL TEST SUITES PASSED SUCCESSFULLY!");
}

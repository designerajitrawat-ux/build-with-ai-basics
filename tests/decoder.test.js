// Run with: node --test
const test = require("node:test");
const assert = require("node:assert/strict");

const D = require("../js/decoder.js");
const P = require("../js/phrases.js");

test("removes WhatsApp export timestamps and sender names", () => {
  const cleaned = D.cleanText("[04/10/26, 11:03 AM] Rohit (Client): Logo thoda bada karo\n04/10/2026, 23:02 - Priya: Change the font");
  assert.equal(cleaned, "Logo thoda bada karo\nChange the font");
});

test("drops greetings, praise and thanks", () => {
  const points = D.splitPoints("Hi! Saw the new homepage, overall nice work 👍\nThanks!\nOk\nRegards");
  assert.deepEqual(points, []);
});

test("keeps a request that starts with a greeting", () => {
  assert.deepEqual(D.splitPoints("Hi, please change the logo color"), ["Hi, please change the logo color"]);
});

test("splits two requests joined by 'aur'", () => {
  assert.deepEqual(
    D.splitPoints("Header ka color blue kar do aur menu me \"Contact\" add karo"),
    ["Header ka color blue kar do", "Menu me \"Contact\" add karo"]
  );
});

test("does not split short pairs like 'black and white' or 'black aur white'", () => {
  assert.deepEqual(D.splitPoints("Use black & white photos"), ["Use black & white photos"]);
  assert.deepEqual(D.splitPoints("Photos black aur white karo"), ["Photos black aur white karo"]);
});

test("splits sentences, bullets and numbered lists, and strips leading fillers", () => {
  assert.deepEqual(
    D.splitPoints("- Make the logo bigger. Also add a footer link\n2) Remove the slider"),
    ["Make the logo bigger", "Add a footer link", "Remove the slider"]
  );
});

test("English sample becomes 11 points with no greeting or thanks", () => {
  const points = D.splitPoints(P.SAMPLES.en);
  assert.equal(points.length, 11);
  assert.ok(points.every((p) => !/^(hi|thanks)/i.test(p)));
});

test("Hinglish sample becomes 8 points", () => {
  assert.equal(D.splitPoints(P.SAMPLES.hi).length, 8);
});

test("empty or chit-chat-only input gives no items", () => {
  assert.deepEqual(D.decode("   "), []);
  assert.deepEqual(D.decode("Thanks 🙏"), []);
});

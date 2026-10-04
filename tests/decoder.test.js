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

test("finds 'make it pop' and 'premium' in the samples and sends those points to Ask", () => {
  const en = D.decode(P.SAMPLES.en);
  const pop = en.find((i) => /make it pop/i.test(i.text));
  assert.equal(pop.kind, "ask");
  assert.equal(pop.text.slice(pop.matches[0].start, pop.matches[0].end).toLowerCase(), "make it pop");
  const hi = D.decode(P.SAMPLES.hi);
  const premium = hi.find((i) => /premium/.test(i.text));
  assert.equal(premium.kind, "ask");
  assert.ok(premium.question.includes("\"premium\""));
});

test("finds Hinglish vague words 'thoda' and 'kuch alag'", () => {
  const hi = D.decode(P.SAMPLES.hi);
  const words = hi.flatMap((i) => i.matches.map((m) => i.text.slice(m.start, m.end).toLowerCase()));
  assert.ok(words.includes("thoda"));
  assert.ok(words.includes("kuch alag"));
});

test("labels 'big but subtle' style wishes as mixed signals", () => {
  const [item] = D.decode("logo bada karo but subtle");
  assert.equal(item.kind, "ask");
  assert.equal(item.category, "Mixed signals");
  assert.ok(item.question.includes("\"bada\"") && item.question.includes("\"subtle\""));
});

test("Hinglish points get Hinglish questions and English points get English questions", () => {
  const [hi] = D.decode("Banner me kuch alag try karo");
  assert.equal(hi.lang, "hi");
  assert.match(hi.question, /matlab kis cheez se alag/);
  const [en] = D.decode("Can you make it pop?");
  assert.equal(en.lang, "en");
  assert.match(en.question, /^When you say "make it pop"/);
});

test("every Ask item has exactly one question containing the client's words", () => {
  for (const sample of [P.SAMPLES.en, P.SAMPLES.hi]) {
    for (const item of D.decode(sample).filter((i) => i.kind === "ask")) {
      assert.equal(typeof item.question, "string");
      const quoted = item.question.match(/"([^"]+)"/)[1].toLowerCase();
      assert.ok(item.text.toLowerCase().includes(quoted), item.question);
    }
  }
});

test("clear requests stay in Ready to do and get a tag", () => {
  const items = D.decode("Remove the second slider image\nHeader ka color blue kar do\nFix the typo on the contact page");
  assert.deepEqual(items.map((i) => i.kind), ["ready", "ready", "ready"]);
  assert.deepEqual(items.map((i) => i.tag), ["Image", "Color", "Text"]);
});

test("does not flag 'pop-up' or 'plain white background' as vague", () => {
  assert.equal(D.decode("Add a pop-up for the newsletter")[0].kind, "ready");
  assert.equal(D.decode("Use a plain white background")[0].kind, "ready");
});

test("sample results: English 5 ask and 6 ready, Hinglish 4 ask and 4 ready", () => {
  const count = (items, kind) => items.filter((i) => i.kind === kind).length;
  const en = D.decode(P.SAMPLES.en);
  const hi = D.decode(P.SAMPLES.hi);
  assert.deepEqual([count(en, "ask"), count(en, "ready")], [5, 6]);
  assert.deepEqual([count(hi, "ask"), count(hi, "ready")], [4, 4]);
});

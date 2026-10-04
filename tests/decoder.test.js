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
  // A short line with a single Hinglish marker word is still Hinglish.
  assert.equal(D.detectLanguage("Menu me \"Contact\" add karo"), "hi");
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

test("builds an English message with greeting, numbered questions and thanks", () => {
  const ask = D.decode(P.SAMPLES.en).filter((i) => i.kind === "ask");
  const message = D.buildMessage(ask);
  const lines = message.split("\n");
  assert.equal(lines[0], P.MESSAGE.en.open);
  ask.forEach((item, index) => assert.ok(lines.includes(`${index + 1}. ${item.question}`)));
  assert.equal(lines[lines.length - 1], "Thanks!");
});

test("builds a Hinglish message when most questions are Hinglish, and nothing when there are none", () => {
  const ask = D.decode(P.SAMPLES.hi).filter((i) => i.kind === "ask");
  assert.ok(D.buildMessage(ask).startsWith(P.MESSAGE.hi.open));
  assert.equal(D.buildMessage([]), "");
});

test("drops list headings ending in a colon and sign-offs, but keeps requests that start with thanks", () => {
  assert.deepEqual(D.splitPoints("Hey! A few thoughts on v2:\nMove the pricing table above the FAQ\nLet me know when it is ready. Cheers, Sam"),
    ["Move the pricing table above the FAQ"]);
  assert.deepEqual(D.splitPoints("Thanks, please change the logo to the dark version"),
    ["Thanks, please change the logo to the dark version"]);
});

test("catches common English vague feedback", () => {
  const kind = (text) => D.decode(text)[0].category;
  assert.equal(kind("The colors feel a bit off"), "Gut feeling");
  assert.equal(kind("Not loving the icons, can we try something else?"), "Gut feeling");
  assert.equal(kind("Can it feel more friendly?"), "Mood and style");
  assert.equal(kind("Can you make it feel more premium but still approachable?"), "Mixed signals");
  assert.equal(kind("Tone it down a little"), "Amount");
});

test("'white space' is a layout task, not a color task", () => {
  assert.equal(D.decode("Add more white space around the cards")[0].tag, "Layout");
});

test("every question exists in English too, and English mode makes the whole message English", () => {
  const ask = D.decode(P.SAMPLES.hi).filter((i) => i.kind === "ask");
  ask.forEach((item) => {
    assert.equal(D.questionFor(item, "client"), item.questions.hi);
    assert.equal(D.questionFor(item, "en"), item.questions.en);
  });
  const message = D.buildMessage(ask, "en");
  assert.ok(message.startsWith(P.MESSAGE.en.open));
  assert.ok(message.includes("When you say \"premium\"") === false && message.includes("For \"premium\""));
});

test("English questions explain Hinglish words for readers who don't speak Hindi", () => {
  const [item] = D.decode("Banner me kuch alag try karo");
  assert.match(item.questions.en, /^"kuch alag" \(something different\) from what\?/);
  const [mixed] = D.decode("logo bada karo but subtle");
  assert.match(mixed.questions.en, /^"bada" \(big\) and "subtle" can pull/);
  const [ref] = D.decode("Jaisa humne call pe discuss kiya tha waisa footer bana do");
  assert.match(ref.questions.en, /\(as we discussed\)/);
});

test("catches more English vague feedback without flagging clear bug reports", () => {
  const kind = (text) => D.decode(text)[0].category;
  assert.equal(kind("Can we make it more polished and sleek?"), "Mood and style");
  assert.equal(kind("It is not quite there yet"), "Gut feeling");
  assert.equal(kind("Play around with the footer, surprise me"), "Undecided");
  assert.equal(kind("Make sure the CTA is more compelling"), "Text");
  assert.equal(kind("Use on-brand colors for the buttons"), "Unclear reference");
  assert.equal(kind("Increase the logo size a touch"), "Amount");
  assert.equal(D.decode("The contact form isnt working on Safari")[0].kind, "ready");
  assert.equal(D.decode("Use high quality images in the gallery")[0].kind, "ready");
  assert.deepEqual(D.splitPoints("Overall solid start! Notes:"), []);
});

test("clarity score is the share of points that are ready to do", () => {
  assert.equal(D.clarityScore(D.decode(P.SAMPLES.en)), 55);
  assert.equal(D.clarityScore(D.decode(P.SAMPLES.hi)), 50);
  assert.equal(D.clarityScore([]), 0);
});

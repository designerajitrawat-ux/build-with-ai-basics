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

test("finds the client's name in a WhatsApp export", () => {
  assert.equal(D.detectSender(P.SAMPLES.hi), "Rohit");
  assert.equal(D.detectSender("04/10/2026, 23:02 - Priya: Logo bada karo\n04/10/2026, 23:03 - Me: ok\n04/10/2026, 23:04 - Priya: Font change karo"), "Priya");
  assert.equal(D.detectSender(P.SAMPLES.en), "");
});

test("report sorts points into done, in progress and waiting on the client", () => {
  const items = D.decode(P.SAMPLES.en);
  items.filter((i) => i.kind === "ready").slice(0, 4).forEach((i) => { i.done = true; });
  const data = D.reportData(items);
  assert.equal(data.total, 11);
  assert.equal(data.done.length, 4);
  assert.equal(data.doing.length, 2);
  assert.equal(data.waiting.length, 5);
});

test("builds an English report message with names, sections and totals", () => {
  const items = D.decode(P.SAMPLES.en);
  items.filter((i) => i.kind === "ready").forEach((i) => { i.done = true; });
  const text = D.buildReport(items, { client: "Sam", project: "Homepage", date: "4 Oct 2026", from: "Ajit" });
  assert.match(text, /^Hi Sam! Here's an update on your feedback for Homepage \(4 Oct 2026\):/);
  assert.match(text, /✅ Done \(6\)\n• Change the button text to "Book a free call"/);
  assert.doesNotMatch(text, /In progress/);
  assert.match(text, /❓ Waiting on your answer \(5\)\n• "The hero section feels a bit empty"\n   When you say "empty"/);
  assert.match(text, /11 changes in total: 6 done, 0 in progress, 5 waiting on you\.\nThanks!\nAjit$/);
});

test("report follows the question language and works without names", () => {
  const items = D.decode(P.SAMPLES.hi);
  const hi = D.buildReport(items, {});
  assert.match(hi, /^Hi! Aapke feedback ka update:/);
  assert.match(hi, /⏳ Kaam chal raha hai \(4\)/);
  assert.match(hi, /Total 8 changes: 0 ho gaye, 4 par kaam chal raha hai, 4 aapke jawab par ruke hain\./);
  const en = D.buildReport(items, { mode: "en" });
  assert.match(en, /^Hi! Here's an update on your feedback:/);
  assert.match(en, /"thoda" \(a little\)/);
  assert.equal(D.buildReport([], {}), "");
});

test("rebuilds the client's messages from a WhatsApp screenshot", () => {
  const expected = [
    "Hi bhai, design dekha",
    "Logo thoda bada karo",
    "Header ka color blue kar do aur menu me \"Contact\" add karo",
    "Poora page thoda premium lagna chahiye, abhi kuch jam nahi raha",
    "Banner me kuch alag try karo",
    "Font size 16 se 18 kar do",
    "Jaisa humne call pe discuss kiya tha waisa footer bana do",
    "Product photos ki quality improve karo, blur lag rahi hain"
  ].join("\n");
  for (const mode of ["light", "dark"]) {
    const chat = D.chatFromScreenshot(require("./fixtures/whatsapp-ocr-" + mode + ".json"));
    assert.equal(chat.text, expected, mode + " mode text");
    assert.equal(chat.sender, "Rohit", mode + " mode sender");
  }
});

test("screenshot text decodes like a pasted chat", () => {
  const chat = D.chatFromScreenshot(require("./fixtures/whatsapp-ocr-light.json"));
  const items = D.decode(chat.text);
  assert.equal(items.length, 8);
  assert.equal(items.filter((i) => i.kind === "ask").length, 4);
});

test("screenshot cleanup keeps prices, drops your own messages and handles non-chat images", () => {
  const line = (text, x0, y0) => ({ text, x0, y0, x1: x0 + 300, y1: y0 + 30 });
  const chat = D.chatFromScreenshot({ width: 1000, height: 2000, lines: [
    line("9:41", 40, 10),
    line("< 3 Priya Sharma", 60, 80),
    line("Change the price to 12.50 11:02 AM", 50, 400),
    line("Sure, will do 11:03 AM vv", 500, 480),
    line("Make the logo pop 11.04 am", 50, 560)
  ] });
  assert.equal(chat.text, "Change the price to 12.50\nMake the logo pop");
  assert.equal(chat.sender, "Priya Sharma");
  const page = D.chatFromScreenshot({ lines: [line("Please make the header bigger", 200, 100), line("and the font a bit bolder", 200, 135)] });
  assert.equal(page.text, "Please make the header bigger and the font a bit bolder");
  assert.equal(page.sender, "");
  assert.deepEqual(D.chatFromScreenshot({ lines: [] }), { text: "", sender: "" });
});

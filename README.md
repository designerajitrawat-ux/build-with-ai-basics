# Make It Pop

**Paste your client's messy feedback (or a screenshot of the chat). Get a clear to-do list, the exact questions to ask about the vague bits, and a report to send back when the work is done.**

![Make It Pop's feedback round for a Hinglish WhatsApp chat: three steps (ask the client, do the work, report back), vague words highlighted with clarifying questions shown in English, and clear requests as a checklist](docs/screenshot.png)

## The problem

Clients rarely send clean briefs. They send WhatsApp messages like:

> Logo thoda bada karo. Poora page thoda premium lagna chahiye, abhi kuch jam nahi raha. Banner me kuch alag try karo.

Some of that is a clear task. Some of it ("thoda", "premium", "kuch alag", "make it pop") is too vague to act on. Designers guess, the client says "not this", and a revision round is lost. Video editors, writers and social media managers deal with the same thing every week.

## What it does

1. **Paste** the client's message (WhatsApp chat exports, email, anything; English or Hinglish), or **add screenshots** of the WhatsApp chat. Screenshots are read on your device; the client's messages go into the box so you can check them.
2. **Decode** splits it into separate points, drops greetings and thanks, and opens the feedback round in three steps:
   - **1. Ask the client:** vague points, with the vague words highlighted, a label for the kind of vagueness (Mood and style, Mixed signals, Amount, Unclear reference and more) and one clarifying question that quotes the client's own words. **Send questions** gives you one ready message (greeting, numbered questions, thanks) to copy or open in WhatsApp. Questions appear in the client's language, or switch every question to English (Hinglish words get a short English meaning, like "kuch alag" (something different)).
   - **2. Do the work:** clear requests become a checklist with small tags (Text, Color, Image, Layout). Tick them off as you work, and move any point between the lists with one tap if the app guessed wrong.
   - **3. Report back:** a report of what is done, what is in progress and what waits on the client's answer, with the client's name taken from the chat. Send it as a WhatsApp message, or download a PDF where the client can review each change.
3. A **clarity score** shows how much of the message you can act on right away.

## Try it

- **Live:** https://designerajitrawat-ux.github.io/build-with-ai-basics/ (works on a phone too).
- **Demo video (2:40):** https://youtu.be/qGRGaGpegdQ
- **No install:** download or clone this repository and open `index.html` in any modern browser.
- Or serve the folder: `npx serve .` and open the printed address.
- Press **English sample**, **Hinglish sample** or **Screenshot sample**, then **Decode**. The screenshot sample needs the page served from an address (the live link or `npx serve .`), because browsers block reading files from a page opened straight from disk.

## How it works

Everything runs in your browser, screenshots included, so client messages never leave your device and there is nothing to pay for.

- `js/phrases.js` is a hand-made library of vague phrases in English and Hinglish ("make it pop", "premium", "thoda", "kuch alag", "jaisa discuss kiya tha", "bigger but subtle" and many more), grouped by kind, with a question template for each kind in both languages.
- `js/decoder.js` cleans the text, splits it into points, finds vague phrases (including contradictions like "bada karo but subtle"), detects Hinglish, writes the questions and the client report, and turns screenshot text back into the client's messages. It has no page code, so it is tested directly with Node.
- `js/app.js` runs the two screens and the two sheets: it draws the lists, highlights the vague words safely, and handles ticking, moving, sending the questions, the report (message and PDF) and starting over.
- `js/screenshot.js` reads WhatsApp screenshots with [Tesseract.js](https://github.com/naptha/tesseract.js) (Apache-2.0), which is downloaded only when you add a screenshot. The decoder then keeps the client's bubbles (on the left, each ending with its time) and drops times, your own messages and the chat's labels.

## Run the checks

```
node --test
```

Requires Node.js 20 or newer. No packages to install.

## How it was built

Built by [Ajit Rawat](https://github.com/designerajitrawat-ux) for Devpost's **Build With AI: Basics** hackathon, using the Devpost Learn skill pack with an AI coding agent: planning first, building after. The planning documents are in [`devpost/`](devpost/): [scope](devpost/scope.md), [product requirements](devpost/prd.md), [technical spec](devpost/spec.md) and the [build checklist](devpost/checklist.md). A short guide to the code is in [`devpost/app-map.html`](devpost/app-map.html) (download it and open it in a browser).

Fonts: [Fraunces](https://fonts.google.com/specimen/Fraunces) and [DM Sans](https://fonts.google.com/specimen/DM+Sans) from Google Fonts (SIL Open Font License).

## License

[MIT](LICENSE)

---
doc: spec
status: approved
---

# Make It Pop: Technical Spec

## How This Works, In Plain Language
Make It Pop is a web page. Everything happens inside the browser on your own computer or phone, so there is no server, no account and no cost, and the client's message never leaves your device unless you choose to share something.

It has four parts:

1. **The phrase library** is a list written by hand: vague words clients use ("pop", "premium", "thoda", "kuch alag" and many more), grouped by kind, plus a question template for each kind in English and in Hinglish. Think of it as a designer's cheat sheet of "words that cause extra revision rounds".
2. **The decoder** is the brain. It cleans the pasted text, cuts it into separate points, checks each point against the phrase library, and decides: does this point go to "Ask the client" (with a question) or "Ready to do"? It also writes the message with the questions and the progress report for the client.
3. **The screenshot reader** turns a WhatsApp screenshot into text, on the device. It keeps the client's messages and drops times, your own messages and the chat's buttons and labels.
4. **The page** has two screens: one to paste the message, one for the feedback round (ask, do the work, report back). Two pop-up sheets send the questions and the report.

Why no AI service inside the app? A hand-made library is free, instant, works offline, never makes up strange answers in a demo, and keeps client messages private. The app itself is built with an AI coding agent, which is what this hackathon asks for; an "AI mode" for unknown phrases is listed for later.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. The designer opens `index.html` → the browser loads the styles, the phrase library, the decoder, the page logic and the screenshot reader → they see the paste screen.
2. They paste text, press a sample button, or add a screenshot → for a screenshot, the screenshot reader downloads the text recognition engine the first time, reads the picture on the device, and the decoder's `chatFromScreenshot` keeps only the client's messages → the text lands in the box so the designer can check it.
3. They press Decode → the page logic hands the text to the decoder.
4. The decoder cleans WhatsApp clutter → splits the text into points → drops greetings → checks every point against the phrase library → marks each point "ask" or "ready", records which words matched, picks the language, writes the question, and guesses a tag for ready items → returns the list of items.
5. The page logic stores the items, takes the client's name from the WhatsApp export or the screenshot header, switches to the round screen (with a browser history entry, so Back returns to the paste screen) and draws the summary, the three round steps and both lists, wrapping matched words in a highlight.
6. Send questions → a sheet shows the message from `buildMessage` → Copy puts it on the clipboard (if the browser blocks copying, the text in the sheet is selected for copying by hand) or Open in WhatsApp opens a WhatsApp link with the text filled in → step 1 shows as done.
7. Ticking or moving an item → the page logic updates that item in memory → redraws counts, steps, progress and lists.
8. Report back → a sheet asks for client name, project and your name → `buildReport` writes the WhatsApp message and the page logic draws the report document from `reportData` → Copy, Share on WhatsApp, or Download PDF (the browser's print dialog, printing only a copy of the report) → step 3 shows as done.
9. Edit message returns to the paste screen with the text kept; New feedback clears the memory and the box.

## Stack
- **Plain HTML, CSS and JavaScript**, no framework and no build step. Recommended by the agent and accepted under the learner's delegation: the smallest thing that does the job, opens by double-clicking `index.html`, and is easy to host for free. Tradeoff: no ready-made components, which is fine for a small app.
  Docs: [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML), [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS), [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript).
- **Scripts loaded as classic scripts** (not ES modules), so the page also works when opened straight from the file system. The decoder and phrase library also export themselves for Node so the tests can load them.
- **Google Fonts** for Fraunces and DM Sans, with system fonts as fallback. Docs: [Google Fonts](https://fonts.google.com/), [Fraunces](https://fonts.google.com/specimen/Fraunces), [DM Sans](https://fonts.google.com/specimen/DM+Sans).
- **Clipboard API** for copying. Docs: [navigator.clipboard.writeText](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText).
- **`<dialog>`** for the two sheets (built-in focus handling and Escape to close). Docs: [dialog element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog).
- **Browser print** for Download PDF: a print style sheet shows only the report, and the print dialog's "Save as PDF" makes the file. Docs: [window.print](https://developer.mozilla.org/en-US/docs/Web/API/Window/print).
- **Tesseract.js 5.1.1** (Apache-2.0) to read screenshots, with the English model (`4.0.0_best_int`, about 3 MB), which also reads Roman-script Hinglish. Loaded from the jsDelivr CDN only when a screenshot is added, at a pinned version with an integrity hash. Added at the final review at the learner's request; the agent named the tradeoffs (a download the first time, needs internet the first time, can misread) and the learner chose to add it, with the text shown in the box for checking before Decode. Docs: [Tesseract.js](https://github.com/naptha/tesseract.js).
- **localStorage** keeps only the designer's own name for the report, in their browser. Docs: [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
- **Node.js built-in test runner** (`node --test`, Node 20 or newer) for decoder checks; nothing to install. Docs: [node:test](https://nodejs.org/api/test.html).
- Visual checks during the build use a headless browser in the agent's environment; this is not a project dependency.

## Where It Runs and How Someone Tries It
- **Runs in:** any modern browser (Chrome, Edge, Firefox, Safari), laptop or phone. No keys, no install.
- **Try it locally:** download or clone the repository and double-click `index.html`. Optionally serve it with `npx serve .` and open the printed address. The Screenshot sample button needs the page to be served from an address (local server or the live link), because browsers block reading files from a page opened straight from disk.
- **Run the checks:** `node --test` from the project folder.
- **Demo recording:** open the page, use a sample, Decode, show the highlights, questions and round steps, send the questions, tick the tasks, open the report (PDF and WhatsApp views), then show a screenshot being read and the Hinglish sample with the English switch.
- **Submission needs** a short demo video and a public GitHub repository. Deployment is optional; the learner chose GitHub Pages, which can host this folder as-is.
- **Shared links:** live app https://designerajitrawat-ux.github.io/build-with-ai-basics/, public repository https://github.com/designerajitrawat-ux/build-with-ai-basics and demo video https://www.youtube.com/watch?v=qGRGaGpegdQ (both checked without signing in; this video replaces the first one, which showed the single-page version).

## Look and Feel
Carried from `prd.md > Look and Feel`.

- **Color tokens (CSS variables):** paper `#FBF8F1`, ink `#1D1C1A`, muted ink `#625D55`, line `#E8E1D3`, card `#FFFFFF`, highlighter `#FFE066`, tomato (main action, Ask accents) `#C8371C`, done green `#2E7D4F`. Text on tomato and green is white; colors are checked for readable contrast.
- **Type:** Fraunces for the wordmark, titles and report headings; DM Sans for body, buttons and lists. Base size 16px, generous line height.
- **Highlighter:** a background stroke behind the matched words, slightly rotated and with uneven ends (gradient plus small padding), not a flat box.
- **Layout:** two screens. The paste screen is a centred column. The round screen has a slim top bar (Edit message, wordmark, New feedback), the title with chips, three round steps, then the two lists side by side from about 820px wide, and tabs to switch lists below that. Sheets open in the middle on a laptop and slide up from the bottom on a phone.
- **Motion:** short screen and sheet fade-ins, tick animation; respects "reduce motion" settings.
- **Copy tone:** short, warm, slightly witty.

## Components

### Phrase Library
File: `js/phrases.js`. A list of kinds; each kind has a name and label ("Mood and style"), a priority, a list of phrase patterns, and question templates in English and Hinglish that contain a `{phrase}` slot. Also holds an explanation for each kind (shown on its label), short English meanings for Hinglish phrases, the Hinglish marker words, the chit-chat and sign-off patterns to drop, the task tag keywords and phrases, the question message and report wording in both languages, and the two sample messages.
PRD ref: `prd.md > Vague Phrase Detection`, `prd.md > Clarifying Questions`, `prd.md > Feedback Input`, `prd.md > Report Back`.

### Decoder
File: `js/decoder.js`. Pure functions, no page access, so they can be tested in Node:
- `cleanText(raw)` removes WhatsApp export prefixes and normalises spaces.
- `splitPoints(text)` cuts into points and drops chit-chat.
- `findVague(point)` returns matched phrases with positions and kinds, including contradictions.
- `detectLanguage(point)` returns `en` or `hi` (Hinglish) from marker words.
- `buildQuestion(top, lang)` fills the template of the highest-priority kind; every Ask item gets the question in both English and Hinglish, and English questions add a short meaning after Hinglish words.
- `questionFor(item, mode)` returns the question in the client's language or, in English mode, always in English.
- `tagTask(point)` returns Text, Color, Image, Layout or Other.
- `decode(raw)` runs everything and returns items `{ id, text, kind: "ask" | "ready", matches, category, question, lang, tag, done }`.
- `buildMessage(askItems, mode)` returns the WhatsApp-ready questions, all in English when mode is English.
- `detectSender(raw)` returns the client's name from a WhatsApp export (the sender with the most lines).
- `chatFromScreenshot({ width, height, lines })` rebuilds the client's messages from recognised lines: a bubble is lines close together with the same left edge, closed by a time; bubbles on the left are the client's; the header gives the name. Without any times it keeps all text in reading order.
- `reportData(items)`, `reportLang(items, mode)` and `buildReport(items, { mode, client, project, from, date })` sort points into done, in progress and waiting on the client, and write the report message.
PRD ref: `prd.md > Splitting Feedback into Points`, `prd.md > Vague Phrase Detection`, `prd.md > Clarifying Questions`, `prd.md > Send Questions`, `prd.md > Report Back`, `prd.md > Feedback Input`.

### Screenshot Reader
File: `js/screenshot.js`. Handles Add screenshots, a screenshot pasted into the box, a screenshot dropped on the card, and the Screenshot sample. Loads Tesseract.js on first use, reads the screenshots one by one in the order picked, shows progress, adds the text to the box and remembers the client's name for the report.
PRD ref: `prd.md > Feedback Input`.

### Page Logic
File: `js/app.js`. Switches screens (with browser history), keeps the current items in memory, draws the round steps and lists (escaping the client's text safely before adding highlight marks), handles ticking, moving, the two sheets, copying with fallback, WhatsApp links, the report document and its print copy, Edit message and New feedback.
PRD ref: `prd.md > The Core Journey`, `prd.md > Ready-to-Do Checklist`, `prd.md > Fixing Mistakes`, `prd.md > Send Questions`, `prd.md > Report Back`, `prd.md > Starting Over`, `prd.md > States and Boundaries`.

### Page Structure and Styles
Files: `index.html`, `styles.css`. The paste screen, the round screen, the two sheets, the print-only report copy, the confirmation message and the footers; all styling from **Look and Feel**, plus a print style sheet.
PRD ref: `prd.md > Screens and Layout`, `prd.md > Look and Feel`.

## Data Model
In memory, in the page logic:

```
state = {
  items: [ { id, text, kind, matches: [{ start, end }], category, hint, questions: { en, hi }, question, lang, tag, done } ],
  langMode: "client" | "en",
  tab: "ask" | "ready",            // which list shows on a phone
  view: "doc" | "msg",             // report sheet: PDF view or WhatsApp message
  questionsSent, reportSent,       // round steps shown as done
  client, project, from            // names used in the report
}
```

- Created by Decode, changed by ticking, moving and the sheets, cleared by New feedback.
- Saved: only `from` (the designer's own name), in this browser's localStorage. Everything else is cleared by leaving or refreshing the page (matches `prd.md > States and Boundaries`).

## File Structure

```
build-with-ai-basics/
├── index.html            # paste screen, round screen, the two sheets, print copy
├── styles.css            # tokens, layout, highlighter, sheets, report document, print
├── js/
│   ├── phrases.js        # vague phrase library, question and report wording, samples
│   ├── decoder.js        # pure logic: clean, split, detect, question, tag, message, report, screenshot text
│   ├── app.js            # page logic: screens, lists, sheets, copying, report, reset
│   └── screenshot.js     # reads WhatsApp screenshots on the device
├── samples/
│   └── whatsapp-chat.png # the Screenshot sample (a made-up chat)
├── tests/
│   ├── decoder.test.js   # node --test checks for samples, edge cases, report and screenshots
│   └── fixtures/         # recognised lines from light and dark test screenshots
├── README.md             # what it is, how to try it, how it works
├── LICENSE               # MIT open source license (required by the hackathon)
├── docs/
│   └── screenshot.png    # README screenshot
├── devpost/              # planning documents from the Devpost Learn skills
├── .agents/ skills-lock.json   # the installed Devpost Learn skill pack
└── .gitignore
```

## External Services and Dependencies
- **Google Fonts** (stylesheet link for Fraunces and DM Sans). No key, free. If it fails to load, system fonts are used and the app still works.
- **jsDelivr CDN** for Tesseract.js and its English model, only when a screenshot is added. No key, free. The screenshot is read on the device; only the engine is downloaded.
- **WhatsApp links** (`https://wa.me/?text=...`) open WhatsApp with the message filled in, only when the designer presses the button; nothing is sent until they pick a chat and press send.
- No APIs, no database, no hosting required to run.

## Important Failure Modes
- **Copying is blocked** (some browsers when the page is opened from a file, or permission denied) → the message in the sheet is selected, with a hint to copy it by hand.
- **The screenshot reader can't load** (offline the first time) → a message says so; pasting text still works.
- **The screenshot is misread** → the text goes into the box first, with a note to check it before Decode.
- **The image is not a WhatsApp chat** (no times found) → all its text is kept in reading order, for the designer to check.
- **Printing is blocked** (some embedded previews) → Copy message and Share on WhatsApp still send the report.
- **A vague phrase the library does not know** → the point lands in Ready to do; "Ask about this" moves it with a general question.
- **One long line without punctuation** → the joining-word split still breaks it into points; if not, it stays as one point, which is still usable.

## What Was Simplified and Why
- **Hand-made phrase library** instead of an AI model: free, private, instant and predictable in a demo. The fuller version would add an optional AI call for unknown phrases, which needs a key, cost handling and careful prompts.
- **In-memory state** instead of saved rounds: proves the core loop without storage. The fuller version would save rounds on the device first, then optionally in an account.
- **Report as a message and a PDF** instead of a live link the client opens: needs no hosting or saved state. The fuller version could share a read-only link where the client approves each change.
- **Screenshot reading tuned for WhatsApp** (times, left and right bubbles): other chat apps still work through the "no times found" path, with more checking.
- **Roman-script Hinglish only** instead of full Hindi script: covers how most WhatsApp feedback is typed. The fuller version would add Devanagari phrase lists and the Hindi recognition model.

## Decisions and Open Issues
- **Delegated choices:** the learner asked the agent to make the technical choices and will review the finished app. Stack (plain HTML/CSS/JS), classic scripts, no AI service, Google Fonts and Node's built-in tests are agent recommendations accepted under that delegation.
- **Final review requests (learner):** separate screens and pop-ups instead of one long page, a report to send back to the client when the work is done, and adding WhatsApp screenshots as well as pasted text. The agent proposed how: the three round steps, tabs on phones, the report as both a WhatsApp message and a PDF through printing, WhatsApp links, and a screenshot reader that loads only when used and puts the text in the box for checking.
- **Learner uncertainty:** none raised; the learner delegated technical planning. One question the agent expects judges and the learner to ask, "how can it find vague words without AI?", is answered in **How This Works, In Plain Language** and will be shown in the demo.
- **Hosted link:** the learner switched on GitHub Pages (the agent's GitHub access cannot change repository settings). The app is live at https://designerajitrawat-ux.github.io/build-with-ai-basics/ and the full browser checks pass there, including reading a screenshot.

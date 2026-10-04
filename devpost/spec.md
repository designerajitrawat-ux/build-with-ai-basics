---
doc: spec
status: draft
---

# Make It Pop: Technical Spec

## How This Works, In Plain Language
Make It Pop is a single web page. Everything happens inside the browser on your own computer or phone, so there is no server, no account and no cost, and the client's message never leaves your device.

It has three parts:

1. **The phrase library** is a list written by hand: vague words clients use ("pop", "premium", "thoda", "kuch alag" and many more), grouped by kind, plus a question template for each kind in English and in Hinglish. Think of it as a designer's cheat sheet of "words that cause extra revision rounds".
2. **The decoder** is the brain. It cleans the pasted text, cuts it into separate points, checks each point against the phrase library, and decides: does this point go to "Ask the client" (with a question) or "Ready to do"?
3. **The page** shows the results, lets you tick tasks, move items between lists, and copy the questions as one WhatsApp-ready message.

Why no AI service inside the app? A hand-made library is free, instant, works offline, never makes up strange answers in a demo, and keeps client messages private. The app itself is built with an AI coding agent, which is what this hackathon asks for; an "AI mode" for unknown phrases is listed for later.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. The designer opens `index.html` → the browser loads the styles, the phrase library, the decoder and the page logic → they see the empty input.
2. They paste text or press a sample button → the page logic puts the text in the box and enables Decode.
3. They press Decode → the page logic hands the text to the decoder.
4. The decoder cleans WhatsApp clutter → splits the text into points → drops greetings → checks every point against the phrase library → marks each point "ask" or "ready", records which words matched, picks the language, writes the question, and guesses a tag for ready items → returns the list of items.
5. The page logic stores the items in memory and draws the summary line and both lists, wrapping matched words in a highlight.
6. Copy questions → the decoder builds the message from the current "ask" items → the browser clipboard receives it (or a selectable box opens if copying is blocked) → a confirmation appears.
7. Ticking or moving an item → the page logic updates that item in memory → redraws counts, progress and lists.
8. New feedback → the page logic clears the memory and the box and hides the results.

## Stack
- **Plain HTML, CSS and JavaScript**, no framework and no build step. Recommended by the agent and accepted under the learner's delegation: the smallest thing that does the job, opens by double-clicking `index.html`, and is easy to host for free. Tradeoff: no ready-made components, which is fine for one page.
  Docs: [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML), [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS), [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript).
- **Scripts loaded as classic scripts** (not ES modules), so the page also works when opened straight from the file system. The decoder and phrase library also export themselves for Node so the tests can load them.
- **Google Fonts** for Fraunces and DM Sans, with system fonts as fallback. Docs: [Google Fonts](https://fonts.google.com/), [Fraunces](https://fonts.google.com/specimen/Fraunces), [DM Sans](https://fonts.google.com/specimen/DM+Sans).
- **Clipboard API** for copying. Docs: [navigator.clipboard.writeText](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText).
- **Node.js built-in test runner** (`node --test`, Node 20 or newer) for decoder checks; nothing to install. Docs: [node:test](https://nodejs.org/api/test.html).
- Visual checks during the build use a headless browser in the agent's environment; this is not a project dependency.

## Where It Runs and How Someone Tries It
- **Runs in:** any modern browser (Chrome, Edge, Firefox, Safari), laptop or phone. No keys, no install.
- **Try it locally:** download or clone the repository and double-click `index.html`. Optionally serve it with `npx serve .` and open the printed address.
- **Run the checks:** `node --test` from the project folder.
- **Demo recording:** open the page, press "Try a Hinglish sample", Decode, show the highlights and questions, press Copy questions and paste into a WhatsApp-like text field, tick a few tasks, move one item between lists.
- **Submission needs** a short demo video and a public GitHub repository. Deployment is optional; if wanted at `6-ship`, GitHub Pages can host this folder as-is once the repository is public.

## Look and Feel
Carried from `prd.md > Look and Feel`.

- **Color tokens (CSS variables):** paper `#FBF8F1`, ink `#1D1C1A`, muted ink `#6B655C`, line `#E8E1D3`, card `#FFFFFF`, highlighter `#FFE066`, tomato (main action, Ask accents) `#C8371C`, done green `#2E7D4F`. Text on tomato is white; colors are checked for readable contrast during the build.
- **Type:** Fraunces for the wordmark and section titles; DM Sans for body, buttons and lists. Base size 16px, generous line height.
- **Highlighter:** a background stroke behind the matched words, slightly rotated and with uneven ends (gradient plus small padding), not a flat box.
- **Layout:** centred column up to about 1100px wide; results in two columns from about 820px wide, stacked below that.
- **Motion:** short tick animation and a gentle fade-in for results; respects "reduce motion" settings.
- **Copy tone:** short, warm, slightly witty.

## Components

### Phrase Library
File: `js/phrases.js`. A list of kinds; each kind has a name and label ("Mood and style"), a priority, a list of phrase patterns, and question templates in English and Hinglish that contain a `{phrase}` slot. Also holds the Hinglish marker words, the chit-chat words to drop, the task tag keywords, and the two sample messages.
PRD ref: `prd.md > Vague Phrase Detection`, `prd.md > Clarifying Questions`, `prd.md > Feedback Input`.

### Decoder
File: `js/decoder.js`. Pure functions, no page access, so they can be tested in Node:
- `cleanText(raw)` removes WhatsApp export prefixes and normalises spaces.
- `splitPoints(text)` cuts into points and drops chit-chat.
- `findVague(point)` returns matched phrases with positions and kinds, including contradictions.
- `detectLanguage(point)` returns `en` or `hi` (Hinglish) from marker words.
- `buildQuestion(point, matches, lang)` fills the template of the highest-priority kind.
- `tagTask(point)` returns Text, Color, Image, Layout or Other.
- `decode(raw)` runs everything and returns items `{ id, text, kind: "ask" | "ready", matches, category, question, lang, tag, done }`.
- `buildMessage(askItems)` returns the WhatsApp-ready text.
PRD ref: `prd.md > Splitting Feedback into Points`, `prd.md > Vague Phrase Detection`, `prd.md > Clarifying Questions`, `prd.md > Copy Questions Message`.

### Page Logic
File: `js/app.js`. Connects buttons to the decoder, keeps the current items in memory, draws the lists (escaping the client's text safely before adding highlight marks), handles ticking, moving, copying with fallback, the confirmation message, and New feedback.
PRD ref: `prd.md > Ready-to-Do Checklist`, `prd.md > Fixing Mistakes`, `prd.md > Starting Over`, `prd.md > States and Boundaries`.

### Page Structure and Styles
Files: `index.html`, `styles.css`. The header, input zone, results zone with the two lists, the copy fallback box, the confirmation message and the footer; all styling from **Look and Feel**.
PRD ref: `prd.md > Screens and Layout`, `prd.md > Look and Feel`.

## Data Model
Only in memory, in the page logic:

```
state = {
  items: [ { id, text, kind, matches: [{ phrase, start, end, category }], category, question, lang, tag, done } ]
}
```

- Created by Decode, changed by ticking and moving, cleared by New feedback.
- Nothing is saved. Leaving or refreshing the page clears it (matches `prd.md > States and Boundaries`).

## File Structure

```
build-with-ai-basics/
├── index.html            # the one page: header, input, results, copy box, footer
├── styles.css            # color and type tokens, layout, highlighter, animations
├── js/
│   ├── phrases.js        # vague phrase library, question templates, samples, word lists
│   ├── decoder.js        # pure logic: clean, split, detect, question, tag, message
│   └── app.js            # page logic: rendering, ticking, moving, copying, reset
├── tests/
│   └── decoder.test.js   # node --test checks for samples and edge cases
├── README.md             # what it is, how to try it, how it works
├── LICENSE               # MIT open source license (required by the hackathon)
├── devpost/              # planning documents from the Devpost Learn skills
├── .agents/ skills-lock.json   # the installed Devpost Learn skill pack
└── .gitignore
```

## External Services and Dependencies
- **Google Fonts** (stylesheet link for Fraunces and DM Sans). No key, free, no rate limit that matters here. If it fails to load, system fonts are used and the app still works.
- No APIs, no database, no hosting required to run.

## Important Failure Modes
- **Copying is blocked** (some browsers when the page is opened from a file, or permission denied) → a box opens with the full message already selected, plus a hint to copy it by hand.
- **A vague phrase the library does not know** → the point lands in Ready to do; "Ask about this" moves it with a general question.
- **One long line without punctuation** → the joining-word split still breaks it into points; if not, it stays as one point, which is still usable.

## What Was Simplified and Why
- **Hand-made phrase library** instead of an AI model: free, private, instant and predictable in a demo. The fuller version would add an optional AI call for unknown phrases, which needs a key, cost handling and careful prompts.
- **In-memory state** instead of saved rounds: proves the core loop without storage. The fuller version would save rounds on the device first, then optionally in an account.
- **Roman-script Hinglish only** instead of full Hindi script: covers how most WhatsApp feedback is typed. The fuller version would add Devanagari phrase lists.

## Decisions and Open Issues
- **Delegated choices:** the learner asked the agent to make the technical choices and will review the finished app. Stack (plain HTML/CSS/JS), classic scripts, no AI service, Google Fonts and Node's built-in tests are agent recommendations accepted under that delegation, open to change at the final review.
- **Learner uncertainty:** none raised; the learner delegated technical planning. One question the agent expects judges and the learner to ask, "how can it find vague words without AI?", is answered in **How This Works, In Plain Language** and will be shown in the demo.
- **Open:** whether the learner wants a hosted link (GitHub Pages) in addition to the required video and repository; decided at `6-ship`.

---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast (the learner asked to review the finished output rather than each step)

## Slices

- [x] **1. You can paste feedback, press Decode, and see it split into points**
  Becomes usable: A page that opens in the browser, takes pasted feedback (or a sample), and on Decode shows every request as its own point, with WhatsApp clutter and greetings removed.
  Why now: Proves the whole path from text box to screen on the first step, including project setup, so every later step has a place to land.
  PRD ref: `prd.md > The Core Journey` (steps 1-4), `prd.md > Feedback Input`, `prd.md > Splitting Feedback into Points`
  Spec ref: `spec.md > Decoder`, `spec.md > Page Structure and Styles`, `spec.md > File Structure`
  Build: Create `index.html`, `styles.css`, `js/phrases.js` (samples and chit-chat words), `js/decoder.js` (`cleanText`, `splitPoints`, `decode` returning ready items), `js/app.js` (sample buttons, Decode enable/disable, render one plain list), and `tests/decoder.test.js`.
  Verify (mechanical): `node --test` passes splitting checks (WhatsApp prefixes removed, greetings dropped, "aur" split, "black and white" kept); a headless browser opens `index.html`, loads the English sample, presses Decode and finds the expected number of points with no console errors.
  Learner check: Open `index.html`, press "Try an English sample", then Decode, and see each request on its own line.
  Commit: `Split pasted feedback into points`

- [ ] **2. Vague points are highlighted and get a question in the client's language**
  Becomes usable: Decode now sorts points into Ask the client and Ready to do; vague words glow like a highlighter, each Ask item shows its kind and one clarifying question, in English or Hinglish to match the client.
  Why now: This is the unique kernel; it must work early, not be added at the end.
  PRD ref: `prd.md > Vague Phrase Detection`, `prd.md > Clarifying Questions`, `prd.md > Screens and Layout`
  Spec ref: `spec.md > Phrase Library`, `spec.md > Decoder`, `spec.md > Page Logic`
  Build: Fill the phrase library (kinds, patterns, English and Hinglish templates, contradiction pairs, Hinglish marker words); add `findVague`, `detectLanguage`, `buildQuestion`, `tagTask`; render the two lists with safe highlighting and the summary line.
  Verify (mechanical): `node --test` passes detection checks ("make it pop", "premium", "thoda", "kuch alag" found; "logo bada karo but subtle" is a contradiction; Hinglish points get Hinglish questions); headless browser shows highlight marks and one question per Ask item for both samples.
  Learner check: Load the Hinglish sample, press Decode, and check that the vague words are highlighted and each question quotes the client's words.
  Commit: `Highlight vague feedback and suggest clarifying questions`

- [ ] **3. You can copy all questions as one WhatsApp-ready message**
  Becomes usable: Copy questions puts a greeting, numbered questions and a thank-you on the clipboard, with a confirmation, or opens a selectable box if copying is blocked.
  Why now: Sending the questions is the payoff of the kernel; it completes the main loop before smaller features.
  PRD ref: `prd.md > Copy Questions Message`, `prd.md > The Core Journey` (step 7)
  Spec ref: `spec.md > Decoder` (`buildMessage`), `spec.md > Page Logic`, `spec.md > Important Failure Modes`
  Build: Add `buildMessage` with language choice; add the Copy questions button, clipboard write, confirmation message and fallback box.
  Verify (mechanical): `node --test` checks message wording and numbering for English and Hinglish; headless browser presses Copy questions and reads the clipboard text back; blocking the clipboard shows the fallback box.
  Learner check: Decode a sample, press Copy questions, and paste into any chat or notes app.
  Commit: `Copy clarifying questions as a ready message`

- [ ] **4. You can tick tasks off and move wrongly placed items**
  Becomes usable: Ready items can be ticked with progress and an all-done note; "Mark as clear" and "Ask about this" move items between the lists, and counts and the copied message follow; New feedback resets the page.
  Why now: Makes the tool trustworthy and useful through a whole feedback round once the main loop works.
  PRD ref: `prd.md > Ready-to-Do Checklist`, `prd.md > Fixing Mistakes`, `prd.md > Starting Over`
  Spec ref: `spec.md > Page Logic`, `spec.md > Data Model`
  Build: Add ticking with progress line and bar, all-done note, move actions with a general question for moved-in items, New feedback reset.
  Verify (mechanical): Headless browser ticks two of six items and reads "2 of 6 done"; ticks all and sees the all-done note; moves one item each way and checks counts and the copied message; New feedback returns to first-use state.
  Learner check: Tick a few tasks, move one item to the other list, then press New feedback.
  Commit: `Add task ticking, moving items and reset`

- [ ] **5. The finished look, with empty states, on laptop and phone**
  Becomes usable: The desk-and-highlighter design in full: fonts, colors, marker-style highlight, tick animation, friendly empty and nothing-found states, two-column laptop layout and stacked phone layout, plus README and LICENSE.
  Why now: The design criterion judges a complete, coherent product; polish lands once behavior is stable so it is not redone.
  PRD ref: `prd.md > Look and Feel`, `prd.md > States and Boundaries`, `prd.md > Screens and Layout`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Page Structure and Styles`, `spec.md > File Structure`
  Build: Apply color and type tokens, highlighter stroke, motion with reduced-motion support, empty and nothing-found messages, responsive layout, accessible labels and focus styles; write README (what, who, how to try, how it works) and MIT LICENSE.
  Verify (mechanical): `node --test` passes; headless browser screenshots at laptop and phone widths for first use, results, all-done and nothing-found states; text and button colors meet readable contrast; no console errors.
  Learner check: Open the page on a laptop and a phone, run a sample, and say whether it looks and feels right.
  Commit: `Finish design, empty states and docs`

## Hands-on Checkpoints

- [ ] Early usable behavior explored: shared with the final review session, because the learner asked to review only the finished app
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete: feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning wrap-up and `devpost/app-map.html` complete

## Revisions

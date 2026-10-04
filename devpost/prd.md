---
doc: prd
status: approved
---

# Make It Pop: Product Requirements

A one-page web app for freelance designers (and other creative freelancers) that turns a client's messy feedback into a clear to-do list and a ready-to-send set of questions about the vague parts.
Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`, `scope.md > Who It's For`.

## The Core Journey
Develops `scope.md > The Core Loop` and `scope.md > What "Working" Looks Like`.

1. The designer opens the page. They see the name, a one-line promise, a large text box, two sample buttons ("Try an English sample", "Try a Hinglish sample") and a **Decode** button.
2. They paste the client's message (from WhatsApp, email, anywhere) or load a sample.
3. They press **Decode**.
4. Within a second, a summary line appears, for example "9 points found: 3 to ask about, 6 ready to do", followed by two lists.
5. **Ask the client** lists every vague point. The vague words are highlighted like a marker on paper, a small label says what kind of vagueness it is (for example "Mood and style"), and under it sits one clarifying question in the client's own language.
6. **Ready to do** lists every clear point as a checklist.
7. They press **Copy questions**. One message with a greeting, the numbered questions and a thank-you is copied, ready to paste into WhatsApp. A small confirmation appears.
8. While working, they tick tasks off. A progress line ("4 of 6 done") and bar fill up; when everything is ticked, a short "all done" note appears.
9. If the app put a point in the wrong list, one tap moves it to the other list.
10. **New feedback** clears everything for the next round.

Success: the designer sends the questions before starting work, and finishes the round with every task ticked.

## Screens and Layout
One page with two zones.

- **Header:** the wordmark "Make it pop" with the word "pop" marked by the yellow highlighter, and the promise line.
- **Input zone:** the text box, sample buttons on the left, Decode on the right.
- **Results zone** (hidden until the first Decode): summary line, then the two lists side by side on a laptop, **Ask the client** first (left) because those questions should go out before work starts, **Ready to do** second (right). On a phone the two lists stack in the same order.
- **Footer:** a privacy note: "Runs in your browser. Nothing you paste leaves your device."

## Look and Feel
Decided by the agent on the learner's instruction, to be reviewed by the learner on the finished app (see Product Decisions).

- **Idea behind the look:** a designer's desk. Warm paper, black ink, and a yellow highlighter that marks the vague words. The highlighter is the hero of the interface.
- **Colors:** warm paper background, near-black ink text, a soft grey-brown for secondary text, thin warm grey lines, highlighter yellow for vague words, a tomato red for the main action and the "Ask" accents, and a calm green for finished tasks.
- **Type:** an expressive, friendly serif for the name and headings (Fraunces); a clean, readable sans-serif for everything else (DM Sans).
- **Style:** spacious and calm, rounded cards with thin borders rather than heavy shadows, the highlight drawn slightly uneven like a real marker stroke, a satisfying tick animation.
- **Copy tone:** short, warm, a little witty, never making fun of clients.
- **Avoid:** purple gradients, glassy effects, sparkle "AI" icons, emoji overload.

## Features and Behavior

### Feedback Input
Develops `scope.md > The POC Boundary` (text input only).

- Accepts any pasted text and keeps its line breaks.
- Cleans WhatsApp chat-export clutter such as "[12/09/26, 10:32 AM] Rahul:" at the start of lines.
- The two sample buttons fill the box with a realistic message: one in English, one in Hinglish.
- Decode is disabled while the box is empty or only spaces.

- [ ] Pasting a WhatsApp export removes timestamps and sender names from the points.
- [ ] Each sample button fills the box; pressing Decode on it shows both lists filled.
- [ ] With an empty box, Decode cannot be pressed.

### Splitting Feedback into Points
- One point per line, bullet or numbered item, and per sentence inside a line.
- Long sentences joined by "also", "aur", "plus", "and also" or ";" are split when both sides are real requests (at least three words each), so "black and white" or "black aur white" stays whole.
- Greetings, thanks and chit-chat ("hi", "hello sir", "thanks", "ok", "regards", a lone emoji) are dropped.

- [ ] The English sample becomes the expected number of points, with no greeting or thank-you among them.
- [ ] "logo bada karo aur header ka color change karo" becomes two points.

### Vague Phrase Detection
The unique kernel: `scope.md > The Unique Kernel`.

- A built-in library of vague phrases in English and Hinglish, grouped as: Mood and style ("make it pop", "premium", "classy", "modern", "kuch alag"), Amount ("a bit", "thoda", "zara", "slightly"), Color ("vibrant", "bright", "dull", "brand color"), Layout and space ("busy", "cluttered", "khaali khaali", "balance"), Text ("catchy", "stylish font", "better copy"), Unclear reference ("like we discussed", "pehle jaisa", "you know what I mean"), Undecided ("maybe", "shayad", "dekh lo", "your call") and Gut feeling ("not feeling it", "kuch missing hai", "jam nahi raha").
- Contradictions such as "big but subtle", "simple but premium" or "bold lekin subtle" are recognised as their own kind.
- Any point with at least one match goes to **Ask the client**, with every matched phrase highlighted.

- [ ] In the English sample, "make it pop" and "premium" are highlighted and their points are in Ask the client.
- [ ] In the Hinglish sample, "thoda" and "kuch alag" are highlighted.
- [ ] "logo bada karo but subtle" is labelled as a contradiction.

### Clarifying Questions
- Each vague point gets one question built from its kind, quoting the client's own words, for example: When you say "pop", what should change most: brighter colors, a bigger headline, or more contrast? A link to a design you like would help.
- If the point is in Hinglish, the question is in Hinglish (Roman script).
- When several phrases match, the most specific kind decides the question (contradiction first, then the others).

- [ ] Every point in Ask the client shows exactly one question that contains the client's words.
- [ ] Hinglish points get Hinglish questions; English points get English questions.

### Copy Questions Message
- **Copy questions** copies one message: a greeting, the numbered questions, and a thank-you, in the language most of the vague points used.
- A small confirmation says "Copied. Paste it in WhatsApp."
- If the browser blocks copying, the message opens in a box where it can be selected and copied by hand.

- [ ] After pressing Copy questions, the clipboard holds the greeting, every question numbered in order, and the thank-you.

### Ready-to-Do Checklist
- Each clear point is a checklist item with a small tag guessed from its words: Text, Color, Image, Layout or Other.
- Ticking strikes the item through and dims it; the progress line and bar update.
- When all items are ticked: "All done. Time to send it back for review."

- [ ] Ticking two of six items shows "2 of 6 done" and a third-full bar.
- [ ] Ticking every item shows the all-done note.

### Fixing Mistakes
Answers the "what if the app is wrong" question raised in `3-prd`.

- Items in Ask the client have "Mark as clear", which moves them to Ready to do.
- Items in Ready to do have "Ask about this", which moves them to Ask the client with a general question ("Could you tell me a bit more about what you'd like here?").
- Counts, progress and the copied message always reflect the current lists.

- [ ] Moving an item updates both list counts and the next copied message.

### Starting Over
- **New feedback** clears the text box and hides the results.

- [ ] After New feedback, the page looks exactly like first use.

## States and Boundaries
- **First use:** empty text box with a helpful placeholder and the two sample buttons; results hidden.
- **Nothing found:** if the message only had greetings or thanks: "We couldn't find any requests in this message. Try pasting the full feedback."
- **Nothing vague:** Ask the client says "Nothing vague here. Your client was clear this time."
- **Nothing ready:** Ready to do says "Nothing to start yet. Send the questions first."
- **Privacy:** everything happens in the browser; nothing is sent anywhere or stored. Refreshing the page clears it.

## Product Decisions
- **Problem and audience (learner):** the problem comes from the learner's own work: many clients send feedback on WhatsApp in an unprofessional way. The first audience is designers, framed as part of a wider group of creative freelancers (from the scope review).
- **Delegation (learner):** asked to choose the look and details, the learner said "tum apne according jo best kr skte ho kro m final outpt deke feedback dunga" (do what you think is best, I'll give feedback on the final output). The following are therefore the agent's proposals, accepted for building and open to change at the final review:
  - Name "Make It Pop", because it pokes fun at the most famous vague feedback and is easy to remember.
  - The desk-and-highlighter look, so the kernel (highlighting vague words) is also the visual identity.
  - Ask the client shown before Ready to do, because questions should go out before work starts.
  - One-tap moving between lists, so a wrong guess never blocks the designer.
  - Questions in the client's language, because replying in Hinglish to a Hinglish client feels natural.

## What We're Building
Everything under **Features and Behavior** and **States and Boundaries**, on a single page that runs in the browser, with an English and a Hinglish sample.

## Deferred From the POC
- **Saving rounds and projects:** needs storage and a list of past rounds; not needed to prove decoding.
- **Phrase packs for video, writing and social media:** same mechanism, more copy work (`scope.md > Later`).
- **Pinning tasks on a design screenshot:** a separate image feature.
- **Client progress link:** needs sharing and hosting of state.
- **AI mode for unknown phrases:** needs an AI service and cost.
- **Custom phrases added by the user:** needs an editor and saving.

## Possible Later Enhancements
- Devanagari (Hindi script) support for feedback written in Hindi letters.
- Voice-note feedback turned into text before decoding.
- Export the checklist to Notion or Trello.

## Non-Goals
- No login or accounts: nothing is stored, so nothing needs protecting.
- No server: privacy and zero cost are part of the pitch.
- No promise to understand every possible vague phrase: the library covers the common ones, and Fixing Mistakes covers the rest.
- No editing of the client's text inside the lists: the original words matter when quoting them back.

## Open Questions
- None blocking `4-spec`. The learner will review the look, name and behaviors on the finished app.

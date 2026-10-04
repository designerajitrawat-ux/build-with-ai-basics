---
doc: prd
status: approved
---

# Make It Pop: Product Requirements

A small web app for freelance designers (and other creative freelancers) that turns a client's messy feedback into a clear to-do list and a ready-to-send set of questions about the vague parts, then a progress report to send back when the work is done.
Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`, `scope.md > Who It's For`.

## The Core Journey
Develops `scope.md > The Core Loop` and `scope.md > What "Working" Looks Like`.

1. The designer opens the page. They see the name, a one-line promise, a large text box with an **Add screenshots** button, three sample buttons ("English sample", "Hinglish sample", "Screenshot sample") and a **Decode** button.
2. They paste the client's message (from WhatsApp, email, anywhere), add one or more WhatsApp screenshots, or load a sample. Text read from a screenshot appears in the box first, so they can check it.
3. They press **Decode**.
4. The round screen opens with a title and chips, for example "9 points found: 3 to ask, 6 ready, Clarity 67%". The clarity score is the share of points that can be acted on right away. Three steps show where the round stands: **1 Ask the client**, **2 Do the work**, **3 Report back**.
5. **Ask the client** lists every vague point. The vague words are highlighted like a marker on paper, a small label says what kind of vagueness it is (for example "Mood and style"), and under it sits one clarifying question in the client's own language.
6. **Ready to do** lists every clear point as a checklist.
7. They press **Send questions**. A sheet shows one message with a greeting, the numbered questions and a thank-you. **Copy message** puts it on the clipboard; **Open in WhatsApp** opens WhatsApp with the message filled in.
8. While working, they tick tasks off. A progress line ("4 of 6 done") and bar fill up; when everything is ticked, an "all done" note offers **Create report**.
9. If the app put a point in the wrong list, one tap moves it to the other list.
10. **Report back** opens a sheet with the client's name (taken from the chat when possible), the project and their own name, and a report of what is done, what is in progress and what waits on the client's answer. They send it as a WhatsApp message or download it as a PDF the client can review change by change.
11. **Edit message** goes back to the text; **New feedback** clears everything for the next round.

Success: the designer sends the questions before starting work, finishes the round with every task ticked, and sends the client a report of what was done.

## Screens and Layout
Two screens and two sheets, so each moment of the round has its own space (learner request at the final review).

- **Paste screen:** the wordmark "Make it pop" with the word "pop" marked by the yellow highlighter, the promise line, three short steps, the text box with Add screenshots, sample buttons on the left, Decode on the right, and a privacy note: "Everything runs in your browser, screenshots included. Nothing you paste leaves your device unless you choose to share it."
- **Round screen:** a slim top bar (Edit message, wordmark, New feedback), the title and chips, the three round steps (the next one is highlighted, finished ones get a tick), then the two lists side by side on a laptop, **Ask the client** first (left) because those questions should go out before work starts, **Ready to do** second (right). On a phone, tabs switch between the two lists.
- **Send questions sheet** and **Report sheet:** open over the round screen; on a phone they slide up from the bottom.

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
- **Screenshots** (learner request at the final review): Add screenshots picks one or more images; a screenshot can also be pasted into the box or dropped on it. The app reads them on the device, keeps the client's messages (left-side bubbles), drops times, the designer's own messages and the chat's labels, and takes the client's name from the chat header. The text is added to the box with a note to check it before Decode. The reader downloads once (about 3 MB) and needs internet the first time.
- The sample buttons fill the box with a realistic message: one in English, one in Hinglish, and a made-up WhatsApp screenshot.
- Decode is disabled while the box is empty or only spaces.

- [ ] Pasting a WhatsApp export removes timestamps and sender names from the points.
- [ ] Each sample button fills the box; pressing Decode on it shows both lists filled.
- [ ] A WhatsApp screenshot (light or dark mode) becomes the client's messages in the box, one per line.
- [ ] With an empty box, Decode cannot be pressed.

### Splitting Feedback into Points
- One point per line, bullet or numbered item, and per sentence inside a line.
- Long sentences joined by "also", "aur", "plus", "and also" or ";" are split when both sides are real requests (at least three words each), so "black and white" or "black aur white" stays whole.
- Greetings, thanks and chit-chat ("hi", "hello sir", "thanks", "ok", "regards", a lone emoji) are dropped, along with short list headings ending in a colon ("A few thoughts on v2:") and sign-offs ("Let me know when it's ready", "Cheers, Sam").

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
- When any Ask item is in Hinglish, a switch above the list, **Questions in: Client's language / English**, shows every question in English instead. In English, Hinglish words get a short meaning, for example "kuch alag" (something different), so readers who don't speak Hindi can follow. Copy questions uses the same choice.
- Each kind label explains itself on hover (for example, Amount: "Says how much without a number.").
- When several phrases match, the most specific kind decides the question (contradiction first, then the others).

- [ ] Every point in Ask the client shows exactly one question that contains the client's words.
- [ ] Switching to English turns every question and the copied message into English, with meanings next to Hinglish words.
- [ ] Hinglish points get Hinglish questions; English points get English questions.

### Send Questions
- **Send questions** opens a sheet with one message: a greeting, the numbered questions, and a thank-you, in the language most of the vague points used (or English when switched).
- **Copy message** copies it, with a small confirmation: "Copied. Paste it in WhatsApp." **Open in WhatsApp** opens WhatsApp with the message filled in.
- If the browser blocks copying, the message in the sheet is selected so it can be copied by hand.
- Step 1 of the round shows as done once the questions are copied or opened in WhatsApp.

- [ ] After pressing Copy message, the clipboard holds the greeting, every question numbered in order, and the thank-you.

### Ready-to-Do Checklist
- Each clear point is a checklist item with a small tag guessed from its words: Text, Color, Image, Layout or Other.
- Ticking strikes the item through and dims it; the progress line and bar update.
- When all items are ticked: "All done. Time to send it back for review." with a **Create report** button.

- [ ] Ticking two of six items shows "2 of 6 done" and a third-full bar.
- [ ] Ticking every item shows the all-done note.

### Fixing Mistakes
Answers the "what if the app is wrong" question raised in `3-prd`.

- Items in Ask the client have "Mark as clear", which moves them to Ready to do.
- Items in Ready to do have "Ask about this", which moves them to Ask the client with a general question ("Could you tell me a bit more about what you'd like here?").
- Counts, progress and the copied message always reflect the current lists.

- [ ] Moving an item updates both list counts and the next copied message.

### Report Back
Learner request at the final review: when the changes are done, share a professional report with the client.

- **Report back** (round step 3, or Create report when all is done) opens a sheet with three optional fields: client name (filled from the WhatsApp export or screenshot when possible), project, and the designer's own name (remembered in this browser).
- The report lists **Done**, **In progress** and **Waiting on your answer** (with the question), with totals and a progress bar, in the same language choice as the questions.
- **PDF report** view: a clean document with a "Your review" box next to each finished change, so the client can check them one by one. **Download PDF** opens the print dialog with only the report.
- **WhatsApp message** view: the same report as text. **Copy message** or **Share on WhatsApp** sends it.
- Step 3 of the round shows as done once the report is shared.

- [ ] With all tasks ticked, the report shows them under Done with a review box each, and the waiting questions under Waiting on your answer.
- [ ] Download PDF prints only the report.

### Starting Over
- **Edit message** goes back to the paste screen with the text kept (the browser's Back button does the same).
- **New feedback** clears the text box and returns to the paste screen.

- [ ] After New feedback, the page looks exactly like first use.

## States and Boundaries
- **First use:** empty text box with a helpful placeholder and the two sample buttons; results hidden.
- **Nothing found:** if the message only had greetings or thanks, the paste screen stays and says: "We couldn't find any requests in this message. Try pasting the full feedback."
- **Nothing vague:** Ask the client says "Nothing vague here. Your client was clear this time."
- **Nothing ready:** Ready to do says "Nothing to start yet. Send the questions first."
- **Privacy:** everything happens in the browser, screenshots included; nothing is sent anywhere unless the designer opens WhatsApp. Only the designer's own name is remembered, in their browser. Refreshing the page clears the rest.

## Product Decisions
- **Problem and audience (learner):** the problem comes from the learner's own work: many clients send feedback on WhatsApp in an unprofessional way. The first audience is designers, framed as part of a wider group of creative freelancers (from the scope review).
- **Delegation (learner):** asked to choose the look and details, the learner said "tum apne according jo best kr skte ho kro m final outpt deke feedback dunga" (do what you think is best, I'll give feedback on the final output). The following are therefore the agent's proposals, accepted for building and open to change at the final review:
  - Name "Make It Pop", because it pokes fun at the most famous vague feedback and is easy to remember.
  - The desk-and-highlighter look, so the kernel (highlighting vague words) is also the visual identity.
  - Ask the client shown before Ready to do, because questions should go out before work starts.
  - One-tap moving between lists, so a wrong guess never blocks the designer.
  - Questions in the client's language, because replying in Hinglish to a Hinglish client feels natural.
- **Final review requests (learner):** separate screens and pop-ups instead of one long page; a report for the client once the work is done ("report download ya share to your client"); and WhatsApp screenshots as well as copied text. For screenshots the agent named the tradeoffs (a download the first time, needs internet the first time, can misread) and the learner chose to add it. The agent's proposals for these, accepted for building and open to change: the three round steps, tabs on a phone, the report as both a WhatsApp message and a PDF with review boxes, WhatsApp links, the client's name taken from the chat, and screenshot text going into the box for checking before Decode.
- **English switch (learner, at final review):** the learner pointed out that judges may not read Hinglish and the hackathon is global (all submission materials must be in English), so every question can also be shown in English, with meanings for Hinglish words.

## What We're Building
Everything under **Features and Behavior** and **States and Boundaries**, on a single page that runs in the browser, with an English and a Hinglish sample.

## Deferred From the POC
- **Saving rounds and projects:** needs storage and a list of past rounds; not needed to prove decoding.
- **Phrase packs for video, writing and social media:** same mechanism, more copy work (`scope.md > Later`).
- **Pinning tasks on a design screenshot:** a separate image feature.
- **Client progress link:** a live page where the client approves each change; needs sharing and hosting of state. The report (message and PDF) covers sending progress for now.
- **AI mode for unknown phrases:** needs an AI service and cost.
- **Custom phrases added by the user:** needs an editor and saving.

## Possible Later Enhancements
- Devanagari (Hindi script) support for feedback written in Hindi letters.
- Voice-note feedback turned into text before decoding.
- Reading screenshots fully offline, and screenshots from other chat apps tuned like WhatsApp.
- Export the checklist to Notion or Trello.

## Non-Goals
- No login or accounts: nothing is stored, so nothing needs protecting.
- No server: privacy and zero cost are part of the pitch.
- No promise to understand every possible vague phrase: the library covers the common ones, and Fixing Mistakes covers the rest.
- No editing of the client's text inside the lists: the original words matter when quoting them back.

## Open Questions
- None blocking `4-spec`. The learner will review the look, name and behaviors on the finished app.

---
doc: scope
status: draft
---

# Make It Pop (working title)

A small web app that reads a client's messy feedback and splits it into clear tasks you can do now and vague lines you need to ask about, with a ready-to-send question for each vague line.

> How this scope was made: the learner chose the "client feedback checklist" idea from three small options and said it could be made better. They asked the agent to research the hackathon and propose the strongest version for their approval. On review they confirmed the problem from their own work and asked that the impact reach more people than one niche.

## The Unique Kernel
Most feedback tools only turn text into a to-do list. This one also catches the vague lines, like "make it pop", "thoda premium bana do" or "logo bada karo but subtle", highlights the exact vague words, and turns each one into a short clarifying question to send back to the client, in the same language the client used (English or Hinglish).

## Who It's For
**First user:** a freelance or small-studio designer in India whose clients send feedback on WhatsApp or email, often long, mixed Hindi and English, and full of vague wishes. Today they read it several times, copy points into notes by hand, guess what "premium" means, and lose days in extra revision rounds.

**The same problem, wider:** anyone who turns a client's words into creative work hits the same wall: video editors ("video thoda engaging banao"), content writers ("caption catchy karo"), social media managers, small agencies. India alone has a reported 15 million+ freelancers ([source](https://www.karboncard.com/blog/global-freelancing-trends-india-2026)), and clients everywhere send vague feedback. The proof of concept starts with design feedback because that is where the learner has first-hand experience; other kinds of creative work are a direct next step, not a different product.

## The Core Loop
1. Paste the client's feedback message.
2. Press Decode.
3. See two lists: **Ready to do** (clear tasks as a checklist) and **Needs clarity** (vague lines with the vague words highlighted and a suggested question).
4. Copy all the questions as one message and send it to the client.
5. Tick tasks off while working.

They come back every time a new round of feedback arrives.

## Inspiration & Identity
Calm, friendly and clearly designer-made: a helpful studio assistant with a little wit (the name itself pokes fun at the most famous vague feedback). Clean layout, readable type, one strong accent color. Detailed look and feel is decided in `3-prd`.

## Why This Matters to the Learner
From the learner's own work: "bhut client whatsapp or unprofessional tarike s feedback dete h" (many clients give feedback on WhatsApp and in an unprofessional way). Their goal is a strong, winnable entry whose impact judges can clearly see in people's daily work.

## What "Working" Looks Like
Open the page, paste a real-looking WhatsApp feedback message (or tap a built-in sample), press Decode, and within a second see something like 6 tasks and 3 vague lines. The "oh, that's cool" moment: "make it pop" lights up and becomes "When you say 'pop', do you mean brighter colors, a bigger headline, or more contrast? Could you share one example you like?" Then one tap copies all questions as a message ready to paste in WhatsApp.

## The POC Boundary
- One web page, works in the browser, no login, no server.
- Text input only (paste or sample).
- Splits feedback into separate points (lines, bullets, sentences, joining words like "and", "aur", "also", "bhi").
- A curated vague-phrase library for design feedback (English and Hinglish), grouped into a few areas such as color, size, mood/style, layout and text, each with a question template.
- Two result lists, highlighted vague words, tick-off checklist, copy-questions button.

## Later
- Phrase packs for other creative work: video editing, writing, social media.
- Pin tasks onto a screenshot of the design.
- Shareable progress link for the client.
- AI mode for vague phrases the library does not know.
- Voice-note feedback transcription.
- Save multiple projects and rounds; export to Notion or Trello.
- Let users add their own vague phrases.

## Explicitly Cut
- Accounts and login: not needed to prove decoding works.
- Backend server and database: zero budget, and the proof of concept runs fully in the browser.
- Paid AI APIs: zero budget, and a hand-made phrase library is enough to prove the kernel reliably in a demo.
- Native mobile app: the web page already opens on a phone.
- Phrase packs for every profession in the first version: one well-made pack proves the idea; more packs are copy work, not new proof.

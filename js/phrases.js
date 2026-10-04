/*
 * Make It Pop: phrase library and word lists.
 * Plain data only. Loaded as a classic script in the browser (window.MakeItPopPhrases)
 * and with require() in Node for the tests.
 */
(function (root) {
  "use strict";

  // Messages that are only greetings, thanks or small talk, never requests.
  var CHITCHAT = {
    greeting: /^(hi+|hello+|hey+|helo|hii+|dear\s+\w+|good\s+(morning|afternoon|evening)|namaste|namaskar)\b/i,
    whole: /^(thanks?( (you|so much|a lot|again|bro|bhai|sir|ji))*|thank you( so much| again)?|thx|ty|dhanyavaad|shukriya|ok+a*y*|k|done|sure|great|cool|got it|noted|haan( ji)?|ha|ji|hmm+|regards|best regards|warm regards|best|cheers|thanks (and|&) regards|<media omitted>|this message was deleted|you deleted this message)$/i,
    praise: /\b(nice work|good work|great work|well done|good job|great job|looks good|looks great|looks nice|accha hai|achha hai|badhiya|mast hai|sahi hai|good effort|solid start|good start|great start|nice start|solid work|love it|loving it|great stuff|nice job|well designed)\b/i,
    header: /^(here('s| is| are)? (my|the|some) (feedback|changes|comments|points)|feedback|changes|comments|few (points|changes)|some (points|changes)|kuch changes)\b.{0,30}:$/i,
    signoff: /^(let me know|lmk|talk soon|thanks in advance|looking forward|sent from my|(regards|best regards|kind regards|warm regards|best|cheers|thanks|thank you|thanks again|ty)[,!. ]+[\p{L} .]{1,30}$)/iu
  };

  // Words that show a line is asking for something (used to keep requests that start with a greeting or praise).
  var REQUEST_WORDS = /\b(please|pls|plz|change|make|add|remove|delete|move|use|fix|update|replace|increase|decrease|reduce|try|need|needs|should|can you|could you|want|karo|kar do|kardo|karna|kariye|kijiye|karein|chahiye|daalo|dalo|hatao|badlo|lagao|bana do|banao)\b/i;

  // Filler words at the start of a point that add nothing ("Also, ...", "Aur haan ...").
  var LEADING_FILLER = /^(and also|also|and|plus|aur haan|aur|haan|btw|by the way|one more thing|ek aur cheez|ek aur baat|ok so|so|then|phir|fir)\b[,:]?\s+/i;

  // Joining words that can separate two requests inside one sentence.
  var JOINERS = /,?\s+(?:and also|and then|also|aur|plus|&|phir|fir|uske baad)\s+/i;

  /*
   * Vague-phrase library. Each kind has a label, a priority (lower wins when one point
   * matches several kinds) and groups of phrases that share a question template.
   * Phrases are plain text; entries starting with "re:" are regular expressions.
   * Templates use {phrase} for the client's own words.
   */
  var KINDS = [
    {
      id: "reference", label: "Unclear reference", priority: 1,
      hint: "Points to something you can't see from here.",
      groups: [{
        phrases: [
          "like we discussed", "as discussed", "as we discussed", "like i said", "as i said", "like before",
          "same as before", "like last time", "like the old one", "pehle jaisa", "pehle jaisi", "pehle wala",
          "jaisa bola tha", "jaisa bataya tha", "you know what i mean", "like that website", "like that site",
          "like the reference", "reference jaisa", "something like", "kuch aisa", "kuch waisa", "usi tarah",
          "same vibe as", "on brand", "on-brand", "more on brand", "off brand", "off-brand", "brand feel",
          "re:jaisa\\s+(?:humne|maine|aapne)?\\s*(?:call\\s+(?:pe|par)\\s+)?(?:discuss|baat)\\s+(?:kiya|ki|hui)(?:\\s+th[ai])?"
        ],
        en: "When you say \"{phrase}\", which one exactly do you mean? A link or screenshot would make sure I match it.",
        hi: "\"{phrase}\" se aap exactly kaunsa wala keh rahe ho? Link ya screenshot bhej denge to main bilkul match kar dunga."
      }]
    },
    {
      id: "undecided", label: "Undecided", priority: 2,
      hint: "The client hasn't decided yet.",
      groups: [{
        phrases: [
          "maybe", "may be", "not sure", "shayad", "dekh lo", "dekh lena", "dekh lijiye", "try karke dekho",
          "try kar ke dekho", "see what works", "see what looks good", "your call", "up to you", "jo theek lage",
          "jo sahi lage", "jo accha lage", "whatever you think", "whatever works", "or something", "ya kuch aur",
          "if possible", "possible ho to", "agar ho sake", "play around", "play with it", "explore some options",
          "see what you can do", "do your magic", "surprise me", "go wild"
        ],
        en: "You wrote \"{phrase}\". Should I decide this one, or would you like me to send two options to pick from?",
        hi: "Aapne likha \"{phrase}\". Ye main tay kar doon, ya aapko 2 options bhejun jisme se aap chun lo?"
      }]
    },
    {
      id: "mood", label: "Mood and style", priority: 3,
      hint: "Describes a feeling, not a change you can make.",
      groups: [
        {
          phrases: [
            "make it pop", "re:pop(?!\\s*-?\\s*ups?(?![\\p{L}]))", "jazz it up", "jazz up", "spice it up", "spice up",
            "wow factor", "wow", "zing", "eye-catching", "eye catching", "stand out", "standout", "attractive",
            "jaan daalo", "jaan dalo", "jaan daal do", "lively", "add some life", "more life", "more energy", "more energetic", "more dynamic", "more exciting",
            "more interesting", "more personality", "more character", "make it sing"
          ],
          en: "When you say \"{phrase}\", what should change most: brighter colors, a bigger headline, or more contrast? A link to a design you like would help a lot.",
          hi: "\"{phrase}\" se aapka matlab kya hai: zyada bright colors, bada headline, ya zyada contrast? Koi pasandida design ka link bhej denge to bahut help hogi."
        },
        {
          phrases: [
            "premium", "classy", "classier", "elegant", "luxury", "luxurious", "rich look", "rich feel", "high end",
            "high-end", "sophisticated", "professional look", "more professional", "look professional",
            "expensive look", "costly look", "polished", "more polished", "elevated", "sleek", "slick", "refined",
            "upscale", "luxe"
          ],
          en: "For \"{phrase}\", should I go with more white space, fewer colors, or a more refined font? Is there a brand whose look feels \"{phrase}\" to you?",
          hi: "\"{phrase}\" ke liye kya karun: zyada khaali jagah, kam colors, ya zyada classy font? Koi brand jiska look aapko \"{phrase}\" lagta ho?"
        },
        {
          phrases: [
            "modern", "fresh", "trendy", "youthful", "stylish", "re:cool(?!\\s+(?:tones?|colou?rs?))", "funky",
            "edgy", "sexy", "contemporary", "latest style", "new age", "gen z", "more friendly", "friendly", "welcoming",
            "approachable", "playful", "inviting", "warm feel", "fun", "more minimal", "techy", "futuristic", "retro",
            "vintage", "more corporate", "less corporate"
          ],
          en: "\"{phrase}\" can mean many things. Could you share one or two websites or posts whose style you'd call \"{phrase}\"?",
          hi: "\"{phrase}\" ke kai matlab ho sakte hain. Koi 1-2 website ya post bhej sakte ho jiska style aapko \"{phrase}\" lagta hai?"
        },
        {
          phrases: [
            "kuch alag", "kuch naya", "kuch hatke", "hatke", "different", "unique", "more creative", "creative",
            "out of the box", "something new", "something different", "innovative"
          ],
          en: "\"{phrase}\" from what? Which part feels too ordinary right now: the layout, the colors, or the images?",
          hi: "\"{phrase}\" matlab kis cheez se alag? Abhi kaunsa hissa normal lag raha hai: layout, colors ya images?"
        },
        {
          phrases: [
            "boring", "dull", "re:plain(?!\\s+(?:white|black|background|text|colou?r))", "looks flat", "feels flat",
            "too flat", "bland", "sada", "saada", "feeka", "pheeka", "bekar", "outdated", "old fashioned",
            "old-fashioned", "purana", "cheap look", "cheap looking", "lifeless"
          ],
          en: "It feels \"{phrase}\" right now. What's the first thing you'd change: the colors, the images, or the layout?",
          hi: "Abhi \"{phrase}\" lag raha hai, to sabse pehle kya badlun: colors, images ya layout?"
        },
        {
          phrases: [
            "make it better", "look better", "better look", "accha banao", "achha banao", "acha banao", "accha karo",
            "sundar", "beautiful", "nice look", "mast", "jhakaas", "zabardast", "dhamakedar", "amazing", "awesome",
            "improve the look", "thoda better"
          ],
          en: "What would make it \"{phrase}\" for you? Point me to the one part you'd change first.",
          hi: "Aapke hisaab se ise \"{phrase}\" kya banayega? Sabse pehle kaunsa hissa badlun?"
        }
      ]
    },
    {
      id: "color", label: "Color", priority: 4,
      hint: "Names a color feeling, not an exact color.",
      groups: [{
        phrases: [
          "vibrant", "more colorful", "colorful", "colourful", "bright colors", "bright colours", "brighter",
          "more color", "more colour", "rangeen", "brand colors", "brand colours", "brand color", "brand colour",
          "our colors", "our colours", "theme color", "matching color", "matching colors", "match the brand",
          "brand ke colors", "kuch aur color", "koi aur color", "different color", "different colour", "other color",
          "better color", "better colors", "nice color", "accha color", "warm colors", "warmer", "cool tones",
          "cooler tones", "pastel", "earthy", "rich colors"
        ],
        en: "For \"{phrase}\", do you have exact colors in mind? Brand color codes or a screenshot of colors you like would be perfect.",
        hi: "\"{phrase}\" ke liye koi exact color hai aapke mann mein? Brand ke color codes ya pasandida colors ka screenshot bhej do."
      }]
    },
    {
      id: "layout", label: "Layout and space", priority: 5,
      hint: "Names a problem without saying where.",
      groups: [{
        phrases: [
          "busy", "cluttered", "crowded", "messy", "too much", "empty", "khaali khaali", "khali khali", "khaali",
          "khali", "unbalanced", "balance", "balanced", "breathing room", "more space", "flow", "adjust karo",
          "adjust kar do", "sahi jagah", "properly", "neat", "tidy",
          "cleaner", "clean look", "clean it up", "less busy", "less cluttered", "feels heavy", "too heavy", "too tight",
          "cramped", "more balanced", "more organized", "more organised"
        ],
        en: "When you say \"{phrase}\", which area bothers you most? A quick circle on a screenshot would help me fix exactly that spot.",
        hi: "\"{phrase}\" se aapka matlab kaunsa hissa hai? Screenshot par ek circle bana ke bhej do, main wahi jagah theek kar dunga."
      }]
    },
    {
      id: "text", label: "Text", priority: 6,
      hint: "Asks for better words without saying which.",
      groups: [{
        phrases: [
          "catchy", "punchy", "better copy", "better text", "better wording", "better headline", "strong headline",
          "stronger headline", "impactful", "content theek", "content accha", "text accha", "text theek",
          "wording theek", "stylish font", "fancy font", "better font", "nice font", "accha font", "font accha",
          "font stylish", "readable", "more readable", "professional font", "snappier", "tighten the copy", "rework the copy",
          "better messaging", "stronger cta", "more compelling", "compelling"
        ],
        en: "For \"{phrase}\", should I suggest new wording, or do you have the exact text you'd like to use?",
        hi: "\"{phrase}\" ke liye main naye shabd suggest karun, ya aapke paas exact text hai jo use karna hai?"
      }]
    },
    {
      id: "gut", label: "Gut feeling", priority: 7,
      hint: "Something feels wrong, but not what.",
      groups: [{
        phrases: [
          "not feeling it", "not feeling", "something is missing", "something's missing", "something missing",
          "kuch missing", "kuch kami", "kami lag rahi", "jam nahi raha", "jam nhi raha", "jach nahi raha",
          "jach nhi raha", "maza nahi aa raha", "maza nhi aa raha", "maza nahi aaya", "doesn't work for me",
          "does not work for me", "not working for me", "i don't like it", "i dont like it", "don't like it",
          "dont like it", "pasand nahi aaya", "pasand nhi aaya", "accha nahi lag raha", "achha nahi lag raha",
          "acha nahi lag raha", "theek nahi lag raha", "sahi nahi lag raha", "looks off", "feels off",
          "kuch ajeeb", "ajeeb lag raha", "not happy with", "not loving", "not a fan", "don't love", "dont love", "something's off", "something is off", "not quite there",
          "not quite right", "not there yet", "doesn't feel right", "does not feel right", "underwhelming", "meh",
          "missing something",
          "re:(?:feels?|looks?|seems?)\\s+(?:a\\s+(?:bit|little)\\s+|kind\\s+of\\s+|slightly\\s+|kinda\\s+)off"
        ],
        en: "You mentioned \"{phrase}\". What feels off most: the colors, the layout, the images, or the text? Even one word helps me fix the right thing.",
        hi: "Aapne kaha \"{phrase}\". Sabse zyada kya khatak raha hai: colors, layout, images ya text? Bas ek shabd bhi bata do to main sahi cheez theek karunga."
      }]
    },
    {
      id: "amount", label: "Amount", priority: 8,
      hint: "Says how much without a number.",
      groups: [{
        phrases: [
          "a little bit", "a little", "a bit", "a tad", "slightly", "somewhat", "kind of", "sort of", "kinda",
          "little more", "bit more", "little bigger", "little smaller", "thoda sa", "thoda", "thodi", "thode",
          "zara sa", "zara", "halka sa", "a touch", "a hair", "a smidge", "a tiny bit", "just a bit", "ever so slightly"
        ],
        en: "How much is \"{phrase}\" here: a small nudge (about 10%), clearly noticeable (about 25%), or a big change (50% or more)?",
        hi: "\"{phrase}\" matlab kitna: halka sa (lagbhag 10%), saaf dikhne layak (lagbhag 25%), ya bada badlaav (50% ya zyada)?"
      }]
    }
  ];

  // Mixed signals: a "loud" wish and a "quiet" wish joined by "but", "lekin" and similar.
  var CONTRADICTION = {
    label: "Mixed signals",
    hint: "Asks for two things that pull against each other.",
    priority: 0,
    loud: ["big", "bigger", "bada", "badi", "bade", "large", "larger", "bold", "bolder", "loud", "bright", "brighter",
      "colorful", "colourful", "vibrant", "flashy", "eye-catching", "catchy", "premium", "rich", "luxury", "grand",
      "standout", "attractive", "prominent"],
    quiet: ["subtle", "simple", "minimal", "minimalist", "clean", "light", "soft", "sober", "decent", "small",
      "smaller", "chhota", "chhoti", "understated", "elegant", "plain", "approachable", "friendly", "casual"],
    joiners: ["but", "lekin", "par", "magar", "yet", "while", "phir bhi"],
    en: "\"{a}\" and \"{b}\" can pull in opposite directions. Which one matters more here? An example that gets both right would help a lot.",
    hi: "\"{a}\" aur \"{b}\" thode ulte ho sakte hain. Yahan kaunsa zyada zaroori hai? Koi example jisme dono sahi lage, bhej denge to bahut help hogi."
  };

  // Short English meanings for Hinglish vague phrases, added when questions are shown in English.
  var GLOSS = {
    "thoda": "a little", "thodi": "a little", "thode": "a little", "thoda sa": "just a little", "zara": "a bit",
    "zara sa": "just a bit", "halka sa": "slightly", "thoda better": "a bit better",
    "kuch alag": "something different", "kuch naya": "something new", "kuch hatke": "something offbeat",
    "hatke": "offbeat", "sundar": "beautiful", "mast": "great", "jhakaas": "awesome", "zabardast": "fantastic",
    "dhamakedar": "explosive", "accha banao": "make it nice", "achha banao": "make it nice", "acha banao": "make it nice",
    "accha karo": "make it nice", "jaan daalo": "bring it to life", "jaan dalo": "bring it to life",
    "jaan daal do": "bring it to life", "sada": "plain", "saada": "plain", "feeka": "dull", "pheeka": "dull",
    "bekar": "bad", "purana": "old-fashioned", "khaali": "empty", "khali": "empty", "khaali khaali": "empty",
    "khali khali": "empty", "rangeen": "colorful", "brand ke colors": "the brand's colors",
    "kuch aur color": "some other color", "koi aur color": "some other color", "accha color": "a nice color",
    "sahi jagah": "the right place", "adjust karo": "adjust it", "adjust kar do": "adjust it",
    "content theek": "fix the content", "text theek": "fix the text", "wording theek": "fix the wording",
    "content accha": "better content", "text accha": "better text", "accha font": "a nice font", "font accha": "a nice font",
    "font stylish": "a stylish font", "jam nahi raha": "it isn't working", "jam nhi raha": "it isn't working",
    "jach nahi raha": "it doesn't suit", "jach nhi raha": "it doesn't suit", "kuch missing": "something's missing",
    "kuch kami": "something's lacking", "kami lag rahi": "something feels lacking",
    "maza nahi aa raha": "it isn't enjoyable", "maza nhi aa raha": "it isn't enjoyable", "maza nahi aaya": "didn't enjoy it",
    "pasand nahi aaya": "didn't like it", "pasand nhi aaya": "didn't like it", "accha nahi lag raha": "doesn't look good",
    "achha nahi lag raha": "doesn't look good", "acha nahi lag raha": "doesn't look good",
    "theek nahi lag raha": "doesn't look right", "sahi nahi lag raha": "doesn't look right", "kuch ajeeb": "something odd",
    "ajeeb lag raha": "looks odd", "pehle jaisa": "like before", "pehle jaisi": "like before", "pehle wala": "the earlier one",
    "jaisa bola tha": "as I said", "jaisa bataya tha": "as I explained", "kuch aisa": "something like this",
    "kuch waisa": "something like that", "usi tarah": "the same way", "reference jaisa": "like the reference",
    "shayad": "maybe", "dekh lo": "have a look", "dekh lena": "have a look", "dekh lijiye": "have a look",
    "try karke dekho": "try and see", "try kar ke dekho": "try and see", "jo theek lage": "whatever seems right",
    "jo sahi lage": "whatever seems right", "jo accha lage": "whatever looks good", "ya kuch aur": "or something else",
    "possible ho to": "if possible", "agar ho sake": "if possible", "bada": "big", "badi": "big", "bade": "big",
    "chhota": "small", "chhoti": "small"
  };
  // Glosses for phrases matched by a pattern rather than fixed words.
  var GLOSS_PATTERNS = [
    { re: /^jaisa\b.*\b(discuss|baat)\b/i, gloss: "as we discussed" }
  ];

  // Words that show a point is written in Hinglish (Roman-script Hindi mixed with English).
  var HINGLISH_MARKERS = ["karo", "kar", "kardo", "karna", "kariye", "kijiye", "karein", "chahiye", "nahi", "nhi",
    "hai", "hain", "thoda", "thodi", "thode", "zara", "kuch", "jaisa", "jaise", "waisa", "accha", "achha", "acha",
    "bhi", "aur", "lag", "lagna", "raha", "rahi", "rahe", "wala", "wali", "wale", "ka", "ki", "ke", "ko", "se",
    "mein", "abhi", "humne", "aap", "bada", "badi", "chhota", "banao", "bana", "bilkul", "ekdum", "poora", "pura"];

  // Phrases that settle a tag before the single words below ("white space" is layout, not color).
  var TAG_PHRASES = [
    { tag: "Layout", phrases: ["white space", "whitespace", "line spacing", "line height", "letter spacing"] }
  ];

  // Keywords that guess a small tag for clear tasks. Checked in this order.
  var TAGS = [
    { tag: "Color", words: ["color", "colour", "colors", "colours", "rang", "background", "bg", "gradient", "shade",
      "hex", "palette", "red", "blue", "green", "yellow", "orange", "pink", "purple", "black", "white", "grey",
      "gray", "gold", "theme"] },
    { tag: "Text", words: ["font", "fonts", "text", "headline", "heading", "title", "subtitle", "copy", "caption",
      "tagline", "wording", "typo", "spelling", "paragraph", "content", "label"] },
    { tag: "Image", words: ["image", "images", "photo", "photos", "picture", "pictures", "pic", "pics", "icon",
      "icons", "illustration", "logo", "graphic", "banner", "video", "thumbnail", "slider", "gallery", "tasveer"] },
    { tag: "Layout", words: ["spacing", "space", "margin", "padding", "align", "alignment", "layout", "position",
      "move", "upar", "neeche", "left", "right", "center", "centre", "grid", "column", "gap", "section", "footer",
      "header", "menu", "navbar", "nav", "sidebar", "page"] }
  ];

  // The copied message around the numbered questions.
  var MESSAGE = {
    en: { open: "Hi! Thanks for the feedback. A few quick questions so I get this exactly right:", close: "Thanks!" },
    hi: { open: "Hi! Feedback ke liye thanks. Bas kuch chhote sawaal, taaki main bilkul sahi bana sakoon:", close: "Thanks!" }
  };

  // The progress report sent back to the client. {name}, {project}, {date} and the counts are filled in by the decoder.
  var REPORT = {
    en: {
      greet: "Hi{name}! Here's an update on your feedback{project} ({date}):",
      project: " for {project}",
      done: "Done",
      doing: "In progress",
      waiting: "Waiting on your answer",
      total: "{total} {changes} in total: {done} done, {doing} in progress, {waiting} waiting on you.",
      change: "change",
      changes: "changes",
      close: "Thanks!",
      title: "Feedback report",
      untitled: "Your feedback, change by change",
      client: "Client",
      from: "From",
      date: "Date",
      totalLabel: "Total changes",
      review: "Your review",
      reviewNote: "Tick each finished change once you've checked it, or reply with what should still change."
    },
    hi: {
      greet: "Hi{name}! Aapke feedback ka update{project} ({date}):",
      project: ", {project}",
      done: "Ho gaya",
      doing: "Kaam chal raha hai",
      waiting: "Aapke jawab ka intezaar",
      total: "Total {total} {changes}: {done} ho gaye, {doing} par kaam chal raha hai, {waiting} aapke jawab par ruke hain.",
      change: "change",
      changes: "changes",
      close: "Thanks!",
      title: "Feedback report",
      untitled: "Aapka feedback, ek ek change",
      client: "Client",
      from: "From",
      date: "Date",
      totalLabel: "Total changes",
      review: "Aapka review",
      reviewNote: "Har change check karke tick kar dijiye, ya bataiye ki abhi kya badalna hai."
    }
  };

  // Question used when the designer moves a point to "Ask the client" themselves.
  var GENERIC = {
    label: "Your pick",
    hint: "You chose to ask about this one.",
    en: "Could you tell me more about what you'd like here? An example would help.",
    hi: "Yahan aap exactly kya chahte ho, thoda detail mein bata sakte ho? Koi example ho to aur accha."
  };

  var SAMPLES = {
    en: [
      "Hi! Saw the new homepage, overall nice work 👍",
      "The hero section feels a bit empty.",
      "Can you make it pop, it looks too plain right now.",
      "Change the button text to \"Book a free call\".",
      "Logo should be bigger but subtle.",
      "Use our brand colors in the footer.",
      "Also add the client testimonials below the pricing section.",
      "Make the headline font size 48px on desktop.",
      "Remove the second slider image.",
      "Maybe try a different image for the team section, not sure.",
      "Fix the typo on the contact page, it says \"adress\".",
      "Add our Instagram link in the footer.",
      "Thanks!"
    ].join("\n"),
    hi: [
      "[04/10/26, 11:02 AM] Rohit (Client): Hi bhai, design dekha",
      "[04/10/26, 11:03 AM] Rohit (Client): Logo thoda bada karo",
      "[04/10/26, 11:03 AM] Rohit (Client): Header ka color blue kar do aur menu me \"Contact\" add karo",
      "[04/10/26, 11:05 AM] Rohit (Client): Poora page thoda premium lagna chahiye, abhi kuch jam nahi raha",
      "[04/10/26, 11:06 AM] Rohit (Client): Banner me kuch alag try karo",
      "[04/10/26, 11:06 AM] Rohit (Client): Font size 16 se 18 kar do",
      "[04/10/26, 11:07 AM] Rohit (Client): Jaisa humne call pe discuss kiya tha waisa footer bana do",
      "[04/10/26, 11:08 AM] Rohit (Client): Product photos ki quality improve karo, blur lag rahi hain",
      "[04/10/26, 11:09 AM] Rohit (Client): Thanks 🙏"
    ].join("\n")
  };

  var LIB = {
    CHITCHAT: CHITCHAT,
    REQUEST_WORDS: REQUEST_WORDS,
    LEADING_FILLER: LEADING_FILLER,
    JOINERS: JOINERS,
    KINDS: KINDS,
    CONTRADICTION: CONTRADICTION,
    HINGLISH_MARKERS: HINGLISH_MARKERS,
    TAGS: TAGS,
    TAG_PHRASES: TAG_PHRASES,
    GLOSS: GLOSS,
    GLOSS_PATTERNS: GLOSS_PATTERNS,
    MESSAGE: MESSAGE,
    REPORT: REPORT,
    GENERIC: GENERIC,
    SAMPLES: SAMPLES
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = LIB;
  } else {
    root.MakeItPopPhrases = LIB;
  }
})(typeof window !== "undefined" ? window : globalThis);

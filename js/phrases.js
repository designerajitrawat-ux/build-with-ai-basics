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
    praise: /\b(nice work|good work|great work|well done|good job|great job|looks good|looks great|looks nice|accha hai|achha hai|badhiya|mast hai|sahi hai|good effort)\b/i,
    header: /^(here('s| is| are)? (my|the|some) (feedback|changes|comments|points)|feedback|changes|comments|few (points|changes)|some (points|changes)|kuch changes)\b.{0,30}:$/i
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
      groups: [{
        phrases: [
          "like we discussed", "as discussed", "as we discussed", "like i said", "as i said", "like before",
          "same as before", "like last time", "like the old one", "pehle jaisa", "pehle jaisi", "pehle wala",
          "jaisa bola tha", "jaisa bataya tha", "you know what i mean", "like that website", "like that site",
          "like the reference", "reference jaisa", "something like", "kuch aisa", "kuch waisa", "usi tarah",
          "same vibe as",
          "re:jaisa\\s+(?:humne|maine|aapne)?\\s*(?:call\\s+(?:pe|par)\\s+)?(?:discuss|baat)\\s+(?:kiya|ki|hui)(?:\\s+th[ai])?"
        ],
        en: "When you say \"{phrase}\", which one exactly do you mean? A link or screenshot would make sure I match it.",
        hi: "\"{phrase}\" se aap exactly kaunsa wala keh rahe ho? Link ya screenshot bhej denge to main bilkul match kar dunga."
      }]
    },
    {
      id: "undecided", label: "Undecided", priority: 2,
      groups: [{
        phrases: [
          "maybe", "may be", "not sure", "shayad", "dekh lo", "dekh lena", "dekh lijiye", "try karke dekho",
          "try kar ke dekho", "see what works", "see what looks good", "your call", "up to you", "jo theek lage",
          "jo sahi lage", "jo accha lage", "whatever you think", "whatever works", "or something", "ya kuch aur",
          "if possible", "possible ho to", "agar ho sake"
        ],
        en: "You wrote \"{phrase}\". Should I decide this one, or would you like me to send two options to pick from?",
        hi: "Aapne likha \"{phrase}\". Ye main tay kar doon, ya aapko 2 options bhejun jisme se aap chun lo?"
      }]
    },
    {
      id: "mood", label: "Mood and style", priority: 3,
      groups: [
        {
          phrases: [
            "make it pop", "re:pop(?!\\s*-?\\s*ups?(?![\\p{L}]))", "jazz it up", "jazz up", "spice it up", "spice up",
            "wow factor", "wow", "zing", "eye-catching", "eye catching", "stand out", "standout", "attractive",
            "jaan daalo", "jaan dalo", "jaan daal do", "lively", "add some life", "more life"
          ],
          en: "When you say \"{phrase}\", what should change most: brighter colors, a bigger headline, or more contrast? A link to a design you like would help a lot.",
          hi: "\"{phrase}\" se aapka matlab kya hai: zyada bright colors, bada headline, ya zyada contrast? Koi pasandida design ka link bhej denge to bahut help hogi."
        },
        {
          phrases: [
            "premium", "classy", "classier", "elegant", "luxury", "luxurious", "rich look", "rich feel", "high end",
            "high-end", "sophisticated", "professional look", "more professional", "look professional",
            "expensive look", "costly look"
          ],
          en: "For \"{phrase}\", should I go with more white space, fewer colors, or a more refined font? Is there a brand whose look feels \"{phrase}\" to you?",
          hi: "\"{phrase}\" ke liye kya karun: zyada khaali jagah, kam colors, ya zyada classy font? Koi brand jiska look aapko \"{phrase}\" lagta ho?"
        },
        {
          phrases: [
            "modern", "fresh", "trendy", "youthful", "stylish", "re:cool(?!\\s+(?:tones?|colou?rs?))", "funky",
            "edgy", "sexy", "contemporary", "latest style", "new age", "gen z"
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
      groups: [{
        phrases: [
          "busy", "cluttered", "crowded", "messy", "too much", "empty", "khaali khaali", "khali khali", "khaali",
          "khali", "unbalanced", "balance", "balanced", "breathing room", "more space", "flow", "adjust karo",
          "adjust kar do", "sahi jagah", "properly", "neat", "tidy",
          "cleaner", "clean look", "clean it up"
        ],
        en: "When you say \"{phrase}\", which area bothers you most? A quick circle on a screenshot would help me fix exactly that spot.",
        hi: "\"{phrase}\" se aapka matlab kaunsa hissa hai? Screenshot par ek circle bana ke bhej do, main wahi jagah theek kar dunga."
      }]
    },
    {
      id: "text", label: "Text", priority: 6,
      groups: [{
        phrases: [
          "catchy", "punchy", "better copy", "better text", "better wording", "better headline", "strong headline",
          "stronger headline", "impactful", "content theek", "content accha", "text accha", "text theek",
          "wording theek", "stylish font", "fancy font", "better font", "nice font", "accha font", "font accha",
          "font stylish", "readable", "more readable", "professional font"
        ],
        en: "For \"{phrase}\", should I suggest new wording, or do you have the exact text you'd like to use?",
        hi: "\"{phrase}\" ke liye main naye shabd suggest karun, ya aapke paas exact text hai jo use karna hai?"
      }]
    },
    {
      id: "gut", label: "Gut feeling", priority: 7,
      groups: [{
        phrases: [
          "not feeling it", "not feeling", "something is missing", "something's missing", "something missing",
          "kuch missing", "kuch kami", "kami lag rahi", "jam nahi raha", "jam nhi raha", "jach nahi raha",
          "jach nhi raha", "maza nahi aa raha", "maza nhi aa raha", "maza nahi aaya", "doesn't work for me",
          "does not work for me", "not working for me", "i don't like it", "i dont like it", "don't like it",
          "dont like it", "pasand nahi aaya", "pasand nhi aaya", "accha nahi lag raha", "achha nahi lag raha",
          "acha nahi lag raha", "theek nahi lag raha", "sahi nahi lag raha", "looks off", "feels off",
          "kuch ajeeb", "ajeeb lag raha", "not happy with"
        ],
        en: "You mentioned \"{phrase}\". What feels off most: the colors, the layout, the images, or the text? Even one word helps me fix the right thing.",
        hi: "Aapne kaha \"{phrase}\". Sabse zyada kya khatak raha hai: colors, layout, images ya text? Bas ek shabd bhi bata do to main sahi cheez theek karunga."
      }]
    },
    {
      id: "amount", label: "How much?", priority: 8,
      groups: [{
        phrases: [
          "a little bit", "a little", "a bit", "a tad", "slightly", "somewhat", "kind of", "sort of", "kinda",
          "little more", "bit more", "little bigger", "little smaller", "thoda sa", "thoda", "thodi", "thode",
          "zara sa", "zara", "halka sa"
        ],
        en: "How much is \"{phrase}\" here: a small nudge (about 10%), clearly noticeable (about 25%), or a big change (50% or more)?",
        hi: "\"{phrase}\" matlab kitna: halka sa (lagbhag 10%), saaf dikhne layak (lagbhag 25%), ya bada badlaav (50% ya zyada)?"
      }]
    }
  ];

  // Mixed signals: a "loud" wish and a "quiet" wish joined by "but", "lekin" and similar.
  var CONTRADICTION = {
    label: "Mixed signals",
    priority: 0,
    loud: ["big", "bigger", "bada", "badi", "bade", "large", "larger", "bold", "bolder", "loud", "bright", "brighter",
      "colorful", "colourful", "vibrant", "flashy", "eye-catching", "catchy", "premium", "rich", "luxury", "grand",
      "standout", "attractive", "prominent"],
    quiet: ["subtle", "simple", "minimal", "minimalist", "clean", "light", "soft", "sober", "decent", "small",
      "smaller", "chhota", "chhoti", "understated", "elegant", "plain"],
    joiners: ["but", "lekin", "par", "magar", "yet", "while", "phir bhi"],
    en: "\"{a}\" and \"{b}\" can pull in opposite directions. Which one matters more here? An example that gets both right would help a lot.",
    hi: "\"{a}\" aur \"{b}\" thode ulte ho sakte hain. Yahan kaunsa zyada zaroori hai? Koi example jisme dono sahi lage, bhej denge to bahut help hogi."
  };

  // Words that show a point is written in Hinglish (Roman-script Hindi mixed with English).
  var HINGLISH_MARKERS = ["karo", "kar", "kardo", "karna", "kariye", "kijiye", "karein", "chahiye", "nahi", "nhi",
    "hai", "hain", "thoda", "thodi", "thode", "zara", "kuch", "jaisa", "jaise", "waisa", "accha", "achha", "acha",
    "bhi", "aur", "lag", "lagna", "raha", "rahi", "rahe", "wala", "wali", "wale", "ka", "ki", "ke", "ko", "se",
    "mein", "abhi", "humne", "aap", "bada", "badi", "chhota", "banao", "bana", "bilkul", "ekdum", "poora", "pura"];

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
    SAMPLES: SAMPLES
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = LIB;
  } else {
    root.MakeItPopPhrases = LIB;
  }
})(typeof window !== "undefined" ? window : globalThis);

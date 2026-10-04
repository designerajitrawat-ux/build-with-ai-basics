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
    SAMPLES: SAMPLES
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = LIB;
  } else {
    root.MakeItPopPhrases = LIB;
  }
})(typeof window !== "undefined" ? window : globalThis);

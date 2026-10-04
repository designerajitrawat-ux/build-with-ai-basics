/*
 * Make It Pop: the decoder.
 * Pure functions with no page access: clean pasted text, split it into points,
 * and sort the points. Works in the browser (window.MakeItPopDecoder) and in Node.
 */
(function (root) {
  "use strict";

  var P = (typeof module !== "undefined" && module.exports)
    ? require("./phrases.js")
    : root.MakeItPopPhrases;

  // WhatsApp export prefixes, e.g. "[04/10/26, 11:02 AM] Rohit: " or "04/10/2026, 23:02 - Rohit: ".
  var WHATSAPP_PREFIX = /^\s*\[?\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]\.?\s?m\.?)?\]?\s*(?:-\s*)?[^:\n]{1,40}:\s*/i;
  var BULLET = /^\s*(?:[-*•▪◦·>]|\d{1,2}[.)]|[a-h][.)])\s+/i;
  var EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu;

  function cleanText(raw) {
    return String(raw || "")
      .replace(/\r\n?/g, "\n")
      .replace(/ /g, " ")
      .split("\n")
      .map(function (line) { return line.replace(WHATSAPP_PREFIX, "").replace(/[ \t]+/g, " ").trim(); })
      .filter(Boolean)
      .join("\n");
  }

  function wordCount(text) {
    var words = text.replace(EMOJI, " ").match(/[\p{L}\p{N}]+/gu);
    return words ? words.length : 0;
  }

  function isChitChat(text) {
    var bare = text.replace(EMOJI, "").replace(/[!.,?:;]+$/g, "").replace(/\s+/g, " ").trim();
    if (!bare) return true;
    if (P.CHITCHAT.whole.test(bare)) return true;
    if (P.CHITCHAT.header.test(text.trim())) return true;
    var asks = P.REQUEST_WORDS.test(bare);
    // A short line ending in a colon ("A few thoughts on v2:") introduces the list; it is not a task.
    if (/:\s*$/.test(text) && wordCount(text) <= 8 && !asks) return true;
    if (P.CHITCHAT.signoff.test(bare) && !asks) return true;
    if (P.CHITCHAT.greeting.test(bare) && !asks) return true;
    if (P.CHITCHAT.praise.test(bare) && !asks) return true;
    return false;
  }

  function tidy(point) {
    var text = point.replace(P.LEADING_FILLER, "").trim();
    text = text.replace(/[\s,;:.!]+$/g, "").trim();
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Split one sentence on joining words, but only where both sides are real requests.
  function splitOnJoiners(sentence) {
    // Capturing the joiner keeps it, so short pieces like "black aur white" can be glued back.
    var tokens = sentence.split(new RegExp("(" + P.JOINERS.source + ")", "i"));
    var result = [tokens[0]];
    for (var i = 1; i < tokens.length; i += 2) {
      var joiner = tokens[i];
      var next = tokens[i + 1] || "";
      var last = result[result.length - 1];
      if (wordCount(last) >= 3 && wordCount(next) >= 3) {
        result.push(next);
      } else {
        result[result.length - 1] = last + joiner + next;
      }
    }
    return result;
  }

  function splitPoints(text) {
    var points = [];
    cleanText(text).split("\n").forEach(function (line) {
      line = line.replace(BULLET, "");
      line.split(/(?<=[.!?।])\s+(?=\S)|;\s*/).forEach(function (sentence) {
        splitOnJoiners(sentence).forEach(function (piece) {
          if (isChitChat(piece)) return;
          var cleaned = tidy(piece);
          if (wordCount(cleaned) >= 2) points.push(cleaned);
        });
      });
    });
    return points;
  }

  // ---------- Vague phrase detection ----------

  var LETTER_BEFORE = "(?<![\\p{L}\\p{N}])";
  var LETTER_AFTER = "(?![\\p{L}\\p{N}])";

  function phraseSource(phrase) {
    if (phrase.indexOf("re:") === 0) return phrase.slice(3);
    return phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  }

  // One regular expression per phrase group, longest phrases first so "make it pop" wins over "pop".
  var GROUPS = [];
  P.KINDS.forEach(function (kind) {
    kind.groups.forEach(function (group) {
      var sources = group.phrases.slice().sort(function (a, b) { return b.length - a.length; }).map(phraseSource);
      GROUPS.push({
        kind: kind,
        group: group,
        re: new RegExp(LETTER_BEFORE + "(?:" + sources.join("|") + ")" + LETTER_AFTER, "giu")
      });
    });
  });

  var C = P.CONTRADICTION;
  var signalWords = C.loud.concat(C.quiet).sort(function (a, b) { return b.length - a.length; }).map(phraseSource).join("|");
  var CONTRADICTION_RE = new RegExp(
    LETTER_BEFORE + "(" + signalWords + ")" + LETTER_AFTER +
    "[^.\\n]{0,30}?" + LETTER_BEFORE + "(?:" + C.joiners.map(phraseSource).join("|") + ")" + LETTER_AFTER +
    "[^.\\n]{0,30}?" + LETTER_BEFORE + "(" + signalWords + ")" + LETTER_AFTER,
    "giud"
  );

  function sideOf(word) {
    word = word.toLowerCase();
    if (C.loud.indexOf(word) !== -1) return "loud";
    if (C.quiet.indexOf(word) !== -1) return "quiet";
    return null;
  }

  // Returns every vague match in a point, the winning (most specific) one, and merged highlight ranges.
  function findVague(text) {
    var found = [];

    GROUPS.forEach(function (entry) {
      entry.re.lastIndex = 0;
      var m;
      while ((m = entry.re.exec(text)) !== null) {
        found.push({
          phrase: m[0], start: m.index, end: m.index + m[0].length,
          kindId: entry.kind.id, label: entry.kind.label, hint: entry.kind.hint, priority: entry.kind.priority, group: entry.group
        });
        if (m[0].length === 0) entry.re.lastIndex++;
      }
    });

    CONTRADICTION_RE.lastIndex = 0;
    var c;
    while ((c = CONTRADICTION_RE.exec(text)) !== null) {
      var a = sideOf(c[1]);
      var b = sideOf(c[2]);
      if (a && b && a !== b) {
        found.push({
          phrase: c[1], start: c.indices[1][0], end: c.indices[1][1], pair: [c[1], c[2]],
          kindId: "contradiction", label: C.label, hint: C.hint, priority: C.priority
        });
        found.push({
          phrase: c[2], start: c.indices[2][0], end: c.indices[2][1],
          kindId: "contradiction", label: C.label, hint: C.hint, priority: C.priority
        });
      }
      CONTRADICTION_RE.lastIndex = c.indices[2][0];
    }

    var top = null;
    found.forEach(function (f) {
      if (!top || f.priority < top.priority || (f.priority === top.priority && f.start < top.start)) top = f;
    });
    if (top && top.kindId === "contradiction" && !top.pair) {
      top = found.filter(function (f) { return f.pair; })[0] || top;
    }

    return { all: found, top: top, highlights: mergeRanges(found) };
  }

  function mergeRanges(found) {
    var ranges = found.map(function (f) { return { start: f.start, end: f.end }; })
      .sort(function (x, y) { return x.start - y.start || y.end - x.end; });
    var merged = [];
    ranges.forEach(function (r) {
      var last = merged[merged.length - 1];
      if (last && r.start <= last.end) {
        last.end = Math.max(last.end, r.end);
      } else {
        merged.push({ start: r.start, end: r.end });
      }
    });
    return merged;
  }

  function detectLanguage(text) {
    var words = text.toLowerCase().match(/[\p{L}]+/gu) || [];
    var hits = words.filter(function (w) { return P.HINGLISH_MARKERS.indexOf(w) !== -1; }).length;
    if (hits >= 2 || (hits === 1 && words.length <= 6)) return "hi";
    return "en";
  }

  function quoteWords(match) {
    var phrase = match.phrase.replace(/\s+/g, " ");
    // "Maybe try..." is quoted back as "maybe", not "Maybe".
    if (match.start === 0) phrase = phrase.charAt(0).toLowerCase() + phrase.slice(1);
    return phrase;
  }

  // English meaning of a Hinglish phrase, if the library knows one.
  function glossFor(phrase) {
    var key = phrase.toLowerCase().replace(/\s+/g, " ");
    if (P.GLOSS[key]) return P.GLOSS[key];
    for (var i = 0; i < P.GLOSS_PATTERNS.length; i++) {
      if (P.GLOSS_PATTERNS[i].re.test(key)) return P.GLOSS_PATTERNS[i].gloss;
    }
    return null;
  }

  // Puts the client's words into a template slot. In English, the first quote of a Hinglish
  // phrase also gets its meaning: "kuch alag" (something different).
  function fillSlot(template, slot, words, lang) {
    var gloss = lang === "en" ? glossFor(words) : null;
    var quoted = "\"" + slot + "\"";
    if (gloss && template.indexOf(quoted) !== -1) {
      template = template.replace(quoted, "\"" + words + "\" (" + gloss + ")");
    }
    return template.split(slot).join(words);
  }

  function buildQuestion(top, lang) {
    if (top.kindId === "contradiction") {
      var a = quoteWords({ phrase: top.pair[0], start: 1 });
      var b = quoteWords({ phrase: top.pair[1], start: 1 });
      return fillSlot(fillSlot(C[lang], "{a}", a, lang), "{b}", b, lang);
    }
    return fillSlot(top.group[lang], "{phrase}", quoteWords(top), lang);
  }

  function tagTask(text) {
    var lower = text.toLowerCase();
    for (var t = 0; t < P.TAG_PHRASES.length; t++) {
      if (P.TAG_PHRASES[t].phrases.some(function (phrase) { return lower.indexOf(phrase) !== -1; })) return P.TAG_PHRASES[t].tag;
    }
    var words = lower.match(/[\p{L}]+/gu) || [];
    for (var i = 0; i < P.TAGS.length; i++) {
      var tagWords = P.TAGS[i].words;
      if (words.some(function (w) { return tagWords.indexOf(w) !== -1; })) return P.TAGS[i].tag;
    }
    return "Other";
  }

  function decode(raw) {
    return splitPoints(raw).map(function (text, index) {
      var vague = findVague(text);
      var lang = detectLanguage(text);
      // Questions are written in both languages so the designer can switch to English at any time.
      var questions = vague.top ? { en: buildQuestion(vague.top, "en"), hi: buildQuestion(vague.top, "hi") } : null;
      return {
        id: index + 1,
        text: text,
        lang: lang,
        tag: tagTask(text),
        matches: vague.highlights,
        kind: vague.top ? "ask" : "ready",
        category: vague.top ? vague.top.label : null,
        hint: vague.top ? vague.top.hint : null,
        questions: questions,
        question: questions ? questions[lang] : null,
        done: false
      };
    });
  }

  // The question an item shows: in the client's own language, or always in English.
  function questionFor(item, mode) {
    if (!item.questions) return item.question;
    return mode === "en" ? item.questions.en : item.questions[item.lang];
  }

  // One message for WhatsApp: greeting, numbered questions, thanks.
  // In "client" mode the greeting follows the language most questions use; in "en" mode everything is English.
  function buildMessage(askItems, mode) {
    if (!askItems.length) return "";
    var lang = "en";
    if (mode !== "en") {
      var hinglish = askItems.filter(function (i) { return i.lang === "hi"; }).length;
      lang = hinglish > askItems.length - hinglish ? "hi" : "en";
    }
    var words = P.MESSAGE[lang];
    var lines = askItems.map(function (item, index) { return (index + 1) + ". " + questionFor(item, mode); });
    return words.open + "\n\n" + lines.join("\n") + "\n\n" + words.close;
  }

  var API = {
    cleanText: cleanText,
    splitPoints: splitPoints,
    isChitChat: isChitChat,
    findVague: findVague,
    detectLanguage: detectLanguage,
    tagTask: tagTask,
    buildMessage: buildMessage,
    questionFor: questionFor,
    decode: decode
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = API;
  } else {
    root.MakeItPopDecoder = API;
  }
})(typeof window !== "undefined" ? window : globalThis);

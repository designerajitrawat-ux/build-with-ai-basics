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

  function decode(raw) {
    return splitPoints(raw).map(function (text, index) {
      return { id: index + 1, text: text, kind: "ready", matches: [], done: false };
    });
  }

  var API = {
    cleanText: cleanText,
    splitPoints: splitPoints,
    isChitChat: isChitChat,
    decode: decode
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = API;
  } else {
    root.MakeItPopDecoder = API;
  }
})(typeof window !== "undefined" ? window : globalThis);

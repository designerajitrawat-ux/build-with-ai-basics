/*
 * Make It Pop: page logic.
 * Wires the buttons to the decoder, keeps the current items in memory and draws them.
 */
(function () {
  "use strict";

  var Decoder = window.MakeItPopDecoder;
  var Phrases = window.MakeItPopPhrases;

  var $ = function (id) { return document.getElementById(id); };
  var feedback = $("feedback");
  var decodeBtn = $("decode");
  var results = $("results");
  var summary = $("summary");
  var lists = $("lists");
  var askList = $("ask-list");
  var readyList = $("ready-list");

  var state = { items: [] };

  function syncDecodeButton() {
    decodeBtn.disabled = feedback.value.trim() === "";
  }

  // Builds the client's text with vague words wrapped in <mark>, without ever using innerHTML.
  function highlighted(text, ranges) {
    var fragment = document.createDocumentFragment();
    var cursor = 0;
    ranges.forEach(function (r) {
      if (r.start > cursor) fragment.appendChild(document.createTextNode(text.slice(cursor, r.start)));
      var mark = document.createElement("mark");
      mark.className = "hl";
      mark.textContent = text.slice(r.start, r.end);
      fragment.appendChild(mark);
      cursor = r.end;
    });
    if (cursor < text.length) fragment.appendChild(document.createTextNode(text.slice(cursor)));
    return fragment;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderAskItem(item) {
    var li = el("li", "item ask-item");
    li.appendChild(el("span", "kind-label", item.category));
    var quote = el("p", "quote");
    quote.appendChild(highlighted(item.text, item.matches));
    li.appendChild(quote);
    var question = el("p", "question");
    question.appendChild(el("span", "question-label", "Ask: "));
    question.appendChild(document.createTextNode(item.question));
    li.appendChild(question);
    return li;
  }

  function renderReadyItem(item) {
    var li = el("li", "item ready-item");
    li.appendChild(el("span", "tag", item.tag));
    li.appendChild(el("span", "task-text", item.text));
    return li;
  }

  function render() {
    results.hidden = false;
    askList.textContent = "";
    readyList.textContent = "";

    var ask = state.items.filter(function (i) { return i.kind === "ask"; });
    var ready = state.items.filter(function (i) { return i.kind === "ready"; });

    if (state.items.length === 0) {
      summary.textContent = "We couldn't find any requests in this message. Try pasting the full feedback.";
      lists.hidden = true;
      return;
    }
    lists.hidden = false;
    summary.textContent = state.items.length + " points found: " + ask.length + " to ask about, " + ready.length + " ready to do";

    ask.forEach(function (item) { askList.appendChild(renderAskItem(item)); });
    ready.forEach(function (item) { readyList.appendChild(renderReadyItem(item)); });

    $("ask-count").textContent = ask.length;
    $("ready-count").textContent = ready.length;
    $("ask-empty").hidden = ask.length > 0;
    $("ready-empty").hidden = ready.length > 0;
  }

  function runDecode() {
    state.items = Decoder.decode(feedback.value);
    render();
  }

  document.querySelectorAll("[data-sample]").forEach(function (button) {
    button.addEventListener("click", function () {
      feedback.value = Phrases.SAMPLES[button.getAttribute("data-sample")];
      syncDecodeButton();
      feedback.focus();
    });
  });

  feedback.addEventListener("input", syncDecodeButton);
  decodeBtn.addEventListener("click", runDecode);
  syncDecodeButton();
})();

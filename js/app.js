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

  // langMode "client" shows each question in the client's language; "en" shows every question in English.
  var state = { items: [], langMode: "client" };

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

  function actionButton(label, action, item) {
    var button = el("button", "link-btn", label);
    button.type = "button";
    button.setAttribute("data-action", action);
    button.setAttribute("data-id", item.id);
    return button;
  }

  function renderAskItem(item) {
    var li = el("li", "item ask-item");
    li.setAttribute("data-id", item.id);
    var top = el("div", "item-top");
    var label = el("span", "kind-label", item.category);
    if (item.hint) label.title = item.hint;
    top.appendChild(label);
    top.appendChild(actionButton("Mark as clear", "to-ready", item));
    li.appendChild(top);
    var quote = el("p", "quote");
    quote.appendChild(highlighted(item.text, item.matches));
    li.appendChild(quote);
    var question = el("p", "question");
    question.appendChild(el("span", "question-label", "Ask: "));
    question.appendChild(document.createTextNode(Decoder.questionFor(item, state.langMode)));
    li.appendChild(question);
    return li;
  }

  function renderReadyItem(item) {
    var li = el("li", "item ready-item" + (item.done ? " is-done" : ""));
    li.setAttribute("data-id", item.id);
    var label = el("label", "task");
    var box = document.createElement("input");
    box.type = "checkbox";
    box.checked = item.done;
    box.setAttribute("data-action", "toggle");
    box.setAttribute("data-id", item.id);
    label.appendChild(box);
    label.appendChild(el("span", "task-text", item.text));
    li.appendChild(label);
    var meta = el("div", "item-meta");
    meta.appendChild(el("span", "tag", item.tag));
    meta.appendChild(actionButton("Ask about this", "to-ask", item));
    li.appendChild(meta);
    return li;
  }

  function renderProgress(ready) {
    var done = ready.filter(function (i) { return i.done; }).length;
    var total = ready.length;
    $("progress").hidden = total === 0;
    $("progress-text").textContent = done + " of " + total + " done";
    $("progress-fill").style.width = total ? Math.round((done / total) * 100) + "%" : "0%";
    $("all-done").hidden = !(total > 0 && done === total);
  }

  function render() {
    results.hidden = false;
    askList.textContent = "";
    readyList.textContent = "";

    var ask = state.items.filter(function (i) { return i.kind === "ask"; });
    var ready = state.items.filter(function (i) { return i.kind === "ready"; });

    summary.textContent = "";
    if (state.items.length === 0) {
      summary.className = "summary nothing-found";
      summary.textContent = "We couldn't find any requests in this message. Try pasting the full feedback.";
      lists.hidden = true;
      return;
    }
    lists.hidden = false;
    summary.className = "summary";
    summary.appendChild(document.createTextNode(state.items.length + " points found"));
    summary.appendChild(el("span", "chip chip-ask", ask.length + " to ask"));
    summary.appendChild(el("span", "chip chip-ready", ready.length + " ready"));
    var clarity = el("span", "chip chip-clarity", "Clarity " + Decoder.clarityScore(state.items) + "%");
    clarity.title = "Share of points you can act on right away, without asking the client.";
    summary.appendChild(clarity);

    ask.forEach(function (item) { askList.appendChild(renderAskItem(item)); });
    ready.forEach(function (item) { readyList.appendChild(renderReadyItem(item)); });

    $("ask-count").textContent = ask.length;
    $("ready-count").textContent = ready.length;
    $("ask-empty").hidden = ask.length > 0;
    $("copy-questions").disabled = ask.length === 0;
    var anyHinglish = ask.some(function (i) { return i.lang === "hi"; });
    $("lang-switch").hidden = !anyHinglish;
    document.querySelectorAll("[data-lang-mode]").forEach(function (button) {
      var on = button.getAttribute("data-lang-mode") === state.langMode;
      button.classList.toggle("is-active", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
    $("ready-empty").hidden = ready.length > 0;
    renderProgress(ready);
  }

  function findItem(id) {
    return state.items.filter(function (i) { return String(i.id) === String(id); })[0];
  }

  // Ticking and moving use one listener on the lists, so redrawing never loses handlers.
  function handleListAction(event) {
    var target = event.target.closest("[data-action]");
    if (!target) return;
    var item = findItem(target.getAttribute("data-id"));
    if (!item) return;
    var action = target.getAttribute("data-action");
    if (action === "toggle") {
      item.done = target.checked;
    } else if (action === "to-ready") {
      item.kind = "ready";
      item.done = false;
    } else if (action === "to-ask") {
      item.kind = "ask";
      if (!item.questions) {
        item.category = Phrases.GENERIC.label;
        item.hint = Phrases.GENERIC.hint;
        item.questions = { en: Phrases.GENERIC.en, hi: Phrases.GENERIC.hi };
        item.question = item.questions[item.lang];
      }
    }
    render();
    var again = lists.querySelector('[data-id="' + item.id + '"][data-action]');
    if (again) again.focus();
  }

  function startOver() {
    state.items = [];
    state.langMode = "client";
    feedback.value = "";
    results.hidden = true;
    syncDecodeButton();
    feedback.focus();
    window.scrollTo(0, 0);
  }

  var toastTimer = null;
  function showToast(message) {
    var toast = $("toast");
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 2600);
  }

  function openCopyDialog(text) {
    var dialog = $("copy-dialog");
    var box = $("copy-text");
    box.value = text;
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    box.focus();
    box.select();
  }

  // Older way of copying, used when the Clipboard API is missing or refuses.
  function legacyCopy(text) {
    var helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(helper);
    return ok;
  }

  function copyQuestions() {
    var ask = state.items.filter(function (i) { return i.kind === "ask"; });
    var message = Decoder.buildMessage(ask, state.langMode);
    if (!message) return;
    var done = function () { showToast("Copied. Paste it in WhatsApp."); };
    var fallback = function () { if (legacyCopy(message)) done(); else openCopyDialog(message); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(message).then(done, fallback);
    } else {
      fallback();
    }
  }

  function runDecode() {
    state.items = Decoder.decode(feedback.value);
    render();
    results.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  document.querySelectorAll("[data-sample]").forEach(function (button) {
    button.addEventListener("click", function () {
      feedback.value = Phrases.SAMPLES[button.getAttribute("data-sample")];
      syncDecodeButton();
      feedback.focus();
    });
  });

  feedback.addEventListener("input", syncDecodeButton);
  feedback.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && !decodeBtn.disabled) {
      event.preventDefault();
      runDecode();
    }
  });
  decodeBtn.addEventListener("click", runDecode);
  $("copy-questions").addEventListener("click", copyQuestions);
  $("new-feedback").addEventListener("click", startOver);
  lists.addEventListener("click", handleListAction);
  document.querySelectorAll("[data-lang-mode]").forEach(function (button) {
    button.addEventListener("click", function () {
      state.langMode = button.getAttribute("data-lang-mode");
      render();
    });
  });
  syncDecodeButton();
})();

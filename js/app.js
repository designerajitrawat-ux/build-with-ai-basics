/*
 * Make It Pop: page logic.
 * Two screens (paste, then the feedback round) and two sheets (send questions, report back).
 * Keeps the current items in memory and draws them; all wording decisions live in the decoder and phrase library.
 */
(function () {
  "use strict";

  var Decoder = window.MakeItPopDecoder;
  var Phrases = window.MakeItPopPhrases;

  var $ = function (id) { return document.getElementById(id); };
  var feedback = $("feedback");
  var decodeBtn = $("decode");
  var lists = $("lists");
  var askList = $("ask-list");
  var readyList = $("ready-list");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // langMode "client" shows each question in the client's language; "en" shows every question in English.
  var state = {
    items: [],
    langMode: "client",
    tab: "ask",
    view: "doc",
    questionsSent: false,
    reportSent: false,
    client: "",
    project: "",
    from: readSaved("makeitpop.from")
  };

  // The designer's own name is the only thing kept, and only in this browser.
  function readSaved(key) {
    try { return window.localStorage.getItem(key) || ""; } catch (e) { return ""; }
  }
  function save(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* storage blocked: nothing to do */ }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function byKind(kind) {
    return state.items.filter(function (i) { return i.kind === kind; });
  }

  function syncDecodeButton() {
    decodeBtn.disabled = feedback.value.trim() === "";
  }

  // ---------- Screens ----------

  function showScreen(name) {
    var work = name === "work";
    $("screen-compose").hidden = work;
    $("screen-work").hidden = !work;
    window.scrollTo(0, 0);
    if (work) $("work-title").focus({ preventScroll: true }); else feedback.focus({ preventScroll: true });
  }

  function runDecode() {
    var items = Decoder.decode(feedback.value);
    $("nothing-found").hidden = items.length > 0;
    if (!items.length) return;
    state.items = items;
    state.langMode = "client";
    state.tab = "ask";
    state.questionsSent = false;
    state.reportSent = false;
    // A WhatsApp export names the sender on every line; a screenshot reader may have found the name in the chat header.
    state.client = Decoder.detectSender(feedback.value) || feedback.dataset.sender || "";
    render();
    try { history.pushState({ screen: "work" }, "", "#round"); } catch (e) { /* history unavailable */ }
    showScreen("work");
  }

  function editMessage() {
    if (history.state && history.state.screen === "work") history.back(); else showScreen("compose");
  }

  function startOver() {
    state.items = [];
    state.client = "";
    state.project = "";
    feedback.value = "";
    delete feedback.dataset.sender;
    $("nothing-found").hidden = true;
    if (window.MakeItPopScreenshot) window.MakeItPopScreenshot.clearStatus();
    syncDecodeButton();
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* history unavailable */ }
    showScreen("compose");
  }

  window.addEventListener("popstate", function (event) {
    var wantsWork = event.state && event.state.screen === "work" && state.items.length > 0;
    showScreen(wantsWork ? "work" : "compose");
  });

  // ---------- Lists ----------

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

  function renderSummary(ask, ready) {
    var n = state.items.length;
    $("work-title").textContent = n + (n === 1 ? " point found" : " points found");
    var summary = $("summary");
    summary.textContent = "";
    summary.appendChild(el("span", "chip chip-ask", ask.length + " to ask"));
    summary.appendChild(el("span", "chip chip-ready", ready.length + " ready"));
    var clarity = el("span", "chip chip-clarity", "Clarity " + Decoder.clarityScore(state.items) + "%");
    clarity.title = "Share of points you can act on right away, without asking the client.";
    summary.appendChild(clarity);
  }

  // The three steps of a feedback round, with what is done and what to do next.
  function renderRound(ask, ready) {
    var done = ready.filter(function (i) { return i.done; }).length;
    var allDone = ready.length > 0 && done === ready.length;
    var askDone = ask.length === 0 || state.questionsSent;
    var steps = [
      { id: "step-ask", done: askDone, text: ask.length === 0 ? "Nothing to ask" : state.questionsSent ? "Questions sent" : ask.length + (ask.length === 1 ? " question to send" : " questions to send") },
      { id: "step-do", done: allDone, text: ready.length === 0 ? "Nothing ready yet" : done + " of " + ready.length + " done" },
      { id: "step-report", done: state.reportSent, text: state.reportSent ? "Report shared" : allDone ? "Ready to send" : "Share progress anytime" }
    ];
    var next = steps.filter(function (s) { return !s.done; })[0];
    steps.forEach(function (s) {
      var node = $(s.id);
      node.classList.toggle("is-done", s.done);
      node.classList.toggle("is-next", s === next);
      $(s.id + "-status").textContent = s.text;
    });
    $("step-do-fill").style.width = ready.length ? Math.round((done / ready.length) * 100) + "%" : "0%";
  }

  function renderProgress(ready) {
    var done = ready.filter(function (i) { return i.done; }).length;
    var total = ready.length;
    $("progress").hidden = total === 0;
    $("progress-text").textContent = done + " of " + total + " done";
    $("progress-fill").style.width = total ? Math.round((done / total) * 100) + "%" : "0%";
    $("all-done").hidden = !(total > 0 && done === total);
  }

  function renderTabs(ask, ready) {
    lists.setAttribute("data-tab", state.tab);
    $("tab-ask-count").textContent = ask.length;
    $("tab-ready-count").textContent = ready.length;
    document.querySelectorAll("[data-tab]").forEach(function (tab) {
      if (tab === lists) return;
      tab.setAttribute("aria-selected", tab.getAttribute("data-tab") === state.tab ? "true" : "false");
    });
  }

  function render() {
    var ask = byKind("ask");
    var ready = byKind("ready");
    askList.textContent = "";
    readyList.textContent = "";
    ask.forEach(function (item) { askList.appendChild(renderAskItem(item)); });
    ready.forEach(function (item) { readyList.appendChild(renderReadyItem(item)); });

    renderSummary(ask, ready);
    renderRound(ask, ready);
    renderTabs(ask, ready);
    $("ask-count").textContent = ask.length;
    $("ready-count").textContent = ready.length;
    $("ask-empty").hidden = ask.length > 0;
    $("ready-empty").hidden = ready.length > 0;
    $("send-questions").disabled = ask.length === 0;
    $("lang-switch").hidden = !ask.some(function (i) { return i.lang === "hi"; });
    setPressed("[data-lang-mode]", "data-lang-mode", state.langMode);
    renderProgress(ready);
  }

  function setPressed(selector, attr, value) {
    document.querySelectorAll(selector).forEach(function (button) {
      var on = button.getAttribute(attr) === value;
      button.classList.toggle("is-active", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
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

  function showTab(tab) {
    state.tab = tab;
    render();
  }

  // ---------- Copying and sharing ----------

  var toastTimer = null;
  function showToast(message) {
    var toast = $("toast");
    // An open sheet sits above the page, so the toast moves inside it to stay visible.
    var host = document.querySelector("dialog[open]") || document.body;
    if (toast.parentNode !== host) host.appendChild(toast);
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 2600);
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

  // Copies text; if the browser refuses, selects the visible message box so it can be copied by hand.
  function copyText(text, box, onCopied) {
    var done = function () { onCopied(); showToast("Copied. Paste it in WhatsApp."); };
    var fallback = function () {
      if (legacyCopy(text)) { done(); return; }
      box.focus();
      box.select();
      showToast("Copying is blocked here. The text is selected: press Ctrl+C, or long-press to copy.");
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }

  function whatsappLink(text) {
    return "https://wa.me/?text=" + encodeURIComponent(text);
  }

  function fitBox(box) {
    box.style.height = "auto";
    box.style.height = Math.min(box.scrollHeight + 2, 420) + "px";
  }

  function openSheet(dialog) {
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    document.body.classList.add("has-sheet");
  }

  function closeSheet(dialog) {
    if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
  }

  // Sheet 1: send the clarifying questions.
  function questionsMessage() {
    return Decoder.buildMessage(byKind("ask"), state.langMode);
  }

  function openSendSheet() {
    var message = questionsMessage();
    if (!message) return;
    var box = $("send-text");
    box.value = message;
    $("send-wa").href = whatsappLink(message);
    openSheet($("send-dialog"));
    fitBox(box);
  }

  function markQuestionsSent() {
    state.questionsSent = true;
    render();
  }

  // Sheet 2: report back to the client.
  function todayLabel() {
    return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function reportOptions() {
    return { mode: state.langMode, client: state.client, project: state.project, from: state.from, date: todayLabel() };
  }

  // The printable report, built with DOM nodes so nothing the client wrote can become HTML.
  function buildReportDoc() {
    var opts = reportOptions();
    var lang = Decoder.reportLang(state.items, state.langMode);
    var w = Phrases.REPORT[lang];
    var data = Decoder.reportData(state.items);
    var doc = el("article", "doc");

    var head = el("header", "doc-head");
    head.appendChild(el("p", "doc-eyebrow", w.title));
    head.appendChild(el("h2", "doc-title", opts.project.trim() || w.untitled));
    var meta = el("dl", "doc-meta");
    [[w.client, opts.client], [w.date, opts.date], [w.from, opts.from]].forEach(function (pair) {
      if (!String(pair[1] || "").trim()) return;
      var row = el("div");
      row.appendChild(el("dt", "", pair[0]));
      row.appendChild(el("dd", "", pair[1].trim()));
      meta.appendChild(row);
    });
    head.appendChild(meta);
    doc.appendChild(head);

    var stats = el("div", "doc-stats");
    [[data.total, w.totalLabel, ""], [data.done.length, w.done, "is-done"], [data.doing.length, w.doing, "is-doing"], [data.waiting.length, w.waiting, "is-waiting"]].forEach(function (s) {
      var box = el("div", "doc-stat " + s[2]);
      box.appendChild(el("span", "doc-num", String(s[0])));
      box.appendChild(el("span", "doc-label", s[1]));
      stats.appendChild(box);
    });
    doc.appendChild(stats);
    var bar = el("div", "doc-bar");
    var fill = el("span");
    fill.style.width = data.total ? Math.round((data.done.length / data.total) * 100) + "%" : "0%";
    bar.appendChild(fill);
    doc.appendChild(bar);

    var section = function (cls, mark, label, list, withReview, extra) {
      if (!list.length) return;
      var sec = el("section", "doc-sec " + cls);
      var h = el("div", "doc-sec-head");
      h.appendChild(el("h3", "", label + " (" + list.length + ")"));
      if (withReview) h.appendChild(el("span", "doc-review-label", w.review));
      sec.appendChild(h);
      var ol = el("ol", "doc-list");
      list.forEach(function (item) {
        var li = el("li");
        li.appendChild(el("span", "doc-mark", mark));
        var body = el("div", "doc-body");
        body.appendChild(el("p", "doc-text", extra ? "“" + item.text + "”" : item.text));
        if (extra) body.appendChild(el("p", "doc-question", Decoder.questionFor(item, state.langMode)));
        li.appendChild(body);
        if (item.tag && !extra) li.appendChild(el("span", "doc-tag", item.tag));
        if (withReview) li.appendChild(el("span", "doc-box"));
        ol.appendChild(li);
      });
      sec.appendChild(ol);
      doc.appendChild(sec);
    };
    section("sec-done", "✓", w.done, data.done, true, false);
    section("sec-doing", "○", w.doing, data.doing, false, false);
    section("sec-waiting", "?", w.waiting, data.waiting, false, true);
    if (data.done.length) doc.appendChild(el("p", "doc-note", w.reviewNote));
    return doc;
  }

  function renderReport() {
    var text = Decoder.buildReport(state.items, reportOptions());
    var box = $("report-text");
    box.value = text;
    $("report-wa").href = whatsappLink(text);
    var wrap = $("report-doc-wrap");
    wrap.textContent = "";
    wrap.appendChild(buildReportDoc());
    var print = $("print-root");
    print.textContent = "";
    print.appendChild(buildReportDoc());
    $("report-doc-wrap").hidden = state.view !== "doc";
    $("report-msg-wrap").hidden = state.view !== "msg";
    setPressed("[data-view]", "data-view", state.view);
    if (state.view === "msg") fitBox(box);
  }

  function openReportSheet() {
    if (!state.items.length) return;
    $("r-client").value = state.client;
    $("r-project").value = state.project;
    $("r-from").value = state.from;
    renderReport();
    openSheet($("report-dialog"));
  }

  function markReportSent() {
    state.reportSent = true;
    render();
  }

  // ---------- Wiring ----------

  document.querySelectorAll("[data-sample]").forEach(function (button) {
    button.addEventListener("click", function () {
      feedback.value = Phrases.SAMPLES[button.getAttribute("data-sample")];
      delete feedback.dataset.sender;
      if (window.MakeItPopScreenshot) window.MakeItPopScreenshot.clearStatus();
      feedback.scrollTop = 0;
      $("nothing-found").hidden = true;
      syncDecodeButton();
      feedback.focus();
    });
  });

  feedback.addEventListener("input", function () { $("nothing-found").hidden = true; syncDecodeButton(); });
  feedback.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && !decodeBtn.disabled) {
      event.preventDefault();
      runDecode();
    }
  });
  decodeBtn.addEventListener("click", runDecode);
  $("back").addEventListener("click", editMessage);
  $("new-feedback").addEventListener("click", startOver);
  lists.addEventListener("click", handleListAction);

  document.querySelectorAll("[data-lang-mode]").forEach(function (button) {
    button.addEventListener("click", function () {
      state.langMode = button.getAttribute("data-lang-mode");
      render();
    });
  });
  document.querySelectorAll(".tab[data-tab]").forEach(function (tab) {
    tab.addEventListener("click", function () { showTab(tab.getAttribute("data-tab")); });
  });
  document.querySelectorAll("[data-step]").forEach(function (button) {
    button.addEventListener("click", function () {
      var step = button.getAttribute("data-step");
      if (step === "ask") {
        showTab("ask");
        if (byKind("ask").length) openSendSheet();
      } else if (step === "do") {
        showTab("ready");
        $("panel-ready").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      } else {
        openReportSheet();
      }
    });
  });

  $("send-questions").addEventListener("click", openSendSheet);
  $("send-copy").addEventListener("click", function () { copyText($("send-text").value, $("send-text"), markQuestionsSent); });
  $("send-wa").addEventListener("click", markQuestionsSent);

  $("all-done-report").addEventListener("click", openReportSheet);
  [["r-client", "client"], ["r-project", "project"], ["r-from", "from"]].forEach(function (pair) {
    $(pair[0]).addEventListener("input", function (event) {
      state[pair[1]] = event.target.value;
      if (pair[1] === "from") save("makeitpop.from", event.target.value);
      renderReport();
    });
  });
  document.querySelectorAll("[data-view]").forEach(function (button) {
    button.addEventListener("click", function () {
      state.view = button.getAttribute("data-view");
      renderReport();
    });
  });
  $("report-copy").addEventListener("click", function () { copyText($("report-text").value, $("report-text"), markReportSent); });
  $("report-wa").addEventListener("click", markReportSent);
  $("report-pdf").addEventListener("click", function () {
    renderReport();
    markReportSent();
    window.print();
  });

  // Sheets close with their close button, Escape (built in) or a click on the dimmed backdrop.
  document.querySelectorAll("dialog.sheet").forEach(function (dialog) {
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog || event.target.closest("[data-close]")) closeSheet(dialog);
    });
    dialog.addEventListener("close", function () { document.body.classList.remove("has-sheet"); });
  });

  try { if (location.hash === "#round") history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* history unavailable */ }
  syncDecodeButton();
})();

/*
 * Make It Pop: page logic.
 * Wires the buttons to the decoder, keeps the current items in memory and draws them.
 */
(function () {
  "use strict";

  var Decoder = window.MakeItPopDecoder;
  var Phrases = window.MakeItPopPhrases;

  var feedback = document.getElementById("feedback");
  var decodeBtn = document.getElementById("decode");
  var results = document.getElementById("results");
  var summary = document.getElementById("summary");
  var pointsList = document.getElementById("points");

  var state = { items: [] };

  function syncDecodeButton() {
    decodeBtn.disabled = feedback.value.trim() === "";
  }

  function render() {
    results.hidden = false;
    pointsList.textContent = "";
    if (state.items.length === 0) {
      summary.textContent = "We couldn't find any requests in this message. Try pasting the full feedback.";
      return;
    }
    summary.textContent = state.items.length + " points found";
    state.items.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = item.text;
      pointsList.appendChild(li);
    });
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

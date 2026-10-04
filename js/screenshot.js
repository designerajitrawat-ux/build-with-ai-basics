/*
 * Make It Pop: reading WhatsApp screenshots.
 * Text recognition (Tesseract.js, Apache-2.0) runs inside the browser. It is downloaded only when a screenshot
 * is added, so pasting text still works offline, and the screenshot itself never leaves the device.
 * The decoder's chatFromScreenshot turns the recognised lines back into the client's messages.
 */
(function () {
  "use strict";

  var Decoder = window.MakeItPopDecoder;
  var VERSION = "5.1.1";
  var LIBRARY = "https://cdn.jsdelivr.net/npm/tesseract.js@" + VERSION + "/dist/tesseract.min.js";
  var LIBRARY_HASH = "sha384-GJqSu7vueQ9qN0E9yLPb3Wtpd7OrgK8KmYzC8T1IysG1bcvxvIO4qtYR/D3A991F";
  var PATHS = {
    workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@" + VERSION + "/dist/worker.min.js",
    corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@" + VERSION,
    langPath: "https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int"
  };

  var $ = function (id) { return document.getElementById(id); };
  var feedback = $("feedback");
  var picker = $("shot-input");
  var status = $("shot-status");
  var card = feedback.closest(".input-card");
  var loading = null;
  var busy = false;

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = "shot-status" + (kind ? " is-" + kind : "");
    status.hidden = !text;
  }

  function loadLibrary() {
    if (window.Tesseract) return Promise.resolve();
    if (!loading) {
      loading = new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = LIBRARY;
        script.integrity = LIBRARY_HASH;
        script.crossOrigin = "anonymous";
        script.onload = resolve;
        script.onerror = function () { loading = null; reject(new Error("library")); };
        document.head.appendChild(script);
      });
    }
    return loading;
  }

  // The picture's size tells the decoder which side of the screen a bubble is on.
  function imageSize(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve({ width: img.naturalWidth, height: img.naturalHeight }); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("image")); };
      img.src = url;
    });
  }

  function addText(text, sender) {
    var current = feedback.value.replace(/\s+$/, "");
    feedback.value = current ? current + "\n" + text : text;
    if (sender && !feedback.dataset.sender) feedback.dataset.sender = sender;
    feedback.dispatchEvent(new Event("input", { bubbles: true }));
    feedback.scrollTop = feedback.scrollHeight;
  }

  function read(fileList) {
    var files = Array.prototype.filter.call(fileList || [], function (f) { return /^image\//.test(f.type); });
    if (busy) return;
    if (!files.length) { setStatus("Please choose a screenshot (PNG or JPG).", "error"); return; }
    busy = true;
    card.classList.add("is-reading");
    var count = files.length;
    var index = 0;
    var found = [];
    var sender = "";
    var worker = null;
    setStatus("Getting the screenshot reader ready. The first time takes a few seconds.", "busy");

    loadLibrary()
      .then(function () {
        return window.Tesseract.createWorker("eng", 1, Object.assign({
          logger: function (m) {
            if (m.status === "recognizing text") {
              setStatus("Reading screenshot " + (index + 1) + " of " + count + ": " + Math.round(m.progress * 100) + "%", "busy");
            }
          }
        }, PATHS));
      })
      .then(function (w) {
        worker = w;
        // One screenshot at a time, in the order they were picked, so the chat keeps its order.
        return files.reduce(function (chain, file, i) {
          return chain.then(function () {
            index = i;
            return Promise.all([imageSize(file), worker.recognize(file)]).then(function (results) {
              var size = results[0];
              var lines = results[1].data.lines.map(function (l) {
                return { text: l.text, x0: l.bbox.x0, y0: l.bbox.y0, x1: l.bbox.x1, y1: l.bbox.y1 };
              });
              var chat = Decoder.chatFromScreenshot({ width: size.width, height: size.height, lines: lines });
              if (chat.text) found.push(chat.text);
              if (!sender && chat.sender) sender = chat.sender;
            });
          });
        }, Promise.resolve());
      })
      .then(function () {
        if (!found.length) {
          setStatus("No chat messages found in this screenshot. Try a clearer one, or paste the text.", "error");
          return;
        }
        addText(found.join("\n"), sender);
        setStatus("Added the text from " + (count === 1 ? "your screenshot" : count + " screenshots") + ". Check it, fix anything misread, then press Decode.", "done");
      })
      .catch(function () {
        setStatus(navigator.onLine === false
          ? "Reading screenshots needs an internet connection the first time. You can still paste the text."
          : "Couldn't read this screenshot. Try again, or paste the text.", "error");
      })
      .then(function () {
        if (worker) worker.terminate();
        busy = false;
        card.classList.remove("is-reading");
      });
  }

  $("add-shots").addEventListener("click", function () { picker.click(); });

  // A ready-made chat screenshot, so anyone can try this without one of their own.
  $("sample-shot").addEventListener("click", function () {
    if (busy) return;
    feedback.value = "";
    delete feedback.dataset.sender;
    fetch("samples/whatsapp-chat.png")
      .then(function (response) { if (!response.ok) throw new Error("sample"); return response.blob(); })
      .then(function (blob) { read([new File([blob], "whatsapp-chat.png", { type: "image/png" })]); })
      .catch(function () { setStatus("The sample screenshot opens when the app runs from a web address (for example the live link).", "error"); });
  });
  picker.addEventListener("change", function () { read(picker.files); picker.value = ""; });

  // A screenshot pasted straight into the text box (Ctrl+V after copying an image).
  feedback.addEventListener("paste", function (event) {
    var data = event.clipboardData;
    if (!data || !data.files || !data.files.length || data.getData("text")) return;
    event.preventDefault();
    read(data.files);
  });

  // Or dragged onto the card.
  card.addEventListener("dragover", function (event) {
    if (!event.dataTransfer || Array.prototype.indexOf.call(event.dataTransfer.types, "Files") < 0) return;
    event.preventDefault();
    card.classList.add("is-dropping");
  });
  card.addEventListener("dragleave", function (event) {
    if (!card.contains(event.relatedTarget)) card.classList.remove("is-dropping");
  });
  card.addEventListener("drop", function (event) {
    if (!event.dataTransfer || !event.dataTransfer.files.length) return;
    event.preventDefault();
    card.classList.remove("is-dropping");
    read(event.dataTransfer.files);
  });

  window.MakeItPopScreenshot = { read: read, clearStatus: function () { setStatus("", ""); } };
})();

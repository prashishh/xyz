// The audio player (partials/audio-player.html) for every page that lists narrated posts. Each [data-audio] row carries its
// audio folder and the length of each clip by model and voice; the clip itself is <folder><model>/<voice>.mp3, made by
// scripts/narrate-post.mjs. On /audiobook the queue is the posts shown under the topic filter, narrowed to the picked ones
// when any are picked; elsewhere it is the narrated posts on the page, in order. Plays, progress and setting changes are
// sent to Google Analytics as audio_* events.
(function () {
  var items = [].slice.call(document.querySelectorAll("[data-audio]"));
  var bar = document.getElementById("abBar");
  if (!items.length || !bar) return;
  var $ = function (id) { return document.getElementById(id); };
  var voiceSel = $("abVoice"), autoBtn = $("abAuto"), seek = $("abSeek");
  var topics = [].slice.call(document.querySelectorAll(".ab-topic"));
  var modelBtns = [].slice.call(document.querySelectorAll(".ab-model button"));
  var VOICES = JSON.parse(bar.dataset.voices), RATES = [1, 1.5, 2];
  var au = new Audio();
  var cur = -1, rate = 1, auto = true, voice = bar.dataset.voice, model = bar.dataset.model, nextTimer = 0, dragging = false;
  var topic = "", marks = {};
  au.preload = "metadata";

  try {
    var saved = localStorage.getItem("audiobook-voice");
    if (VOICES[saved]) voice = saved;
    if (localStorage.getItem("audiobook-autoplay") === "0") auto = false;
    rate = RATES.indexOf(Number(localStorage.getItem("audiobook-speed"))) >= 0 ? Number(localStorage.getItem("audiobook-speed")) : 1;
    var savedModel = localStorage.getItem("audiobook-model");
    if (savedModel && (!modelBtns.length || modelBtns.some(function (b) { return b.dataset.model === savedModel; }))) model = savedModel;
  } catch (e) {}
  if (voiceSel) voiceSel.value = voice;

  function fmt(t) {
    t = Math.max(0, Math.round(t || 0));
    return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0");
  }
  function part(item, cls) { return item.querySelector(cls); }
  function seconds(item) { return JSON.parse(item.dataset.seconds); }
  // The chosen model and voice, or for a post missing them, the first model and voice it has.
  function clipOf(item) {
    var s = seconds(item), m = s[model] ? model : Object.keys(s)[0];
    var v = s[m][voice] ? voice : Object.keys(s[m])[0];
    return { model: m, voice: v, len: s[m][v] };
  }
  function picked(item) {
    var box = part(item, ".ab-pick input");
    return !!box && box.checked;
  }

  // Sends an event about the playing post to Google Analytics (the gtag in the page header), when it is loaded.
  function track(name, extra) {
    if (typeof window.gtag !== "function" || cur < 0) return;
    var item = items[cur], clip = clipOf(item);
    var params = { post_title: item.dataset.title, post_path: item.dataset.path, voice: clip.voice, model: clip.model, speed: rate, list_page: location.pathname };
    for (var k in extra) params[k] = extra[k];
    window.gtag("event", name, params);
  }

  function queue() {
    var shown = items.filter(function (item) { return !item.hidden; });
    var mine = shown.filter(picked);
    return mine.length ? mine : shown;
  }
  // The next post in the queue after the current one, in list order, so it works even when the current post is not in the
  // queue. A post listed twice on a page, as on the homepage, is not played twice in a row.
  function step(dir) {
    var q = queue(), order = dir > 0 ? q : q.slice().reverse(), playing = cur >= 0 && items[cur].dataset.audio;
    for (var i = 0; i < order.length; i++) {
      var at = items.indexOf(order[i]);
      if ((dir > 0 ? at > cur : at < cur) && order[i].dataset.audio !== playing && !order[i].classList.contains("is-unavailable")) return at;
    }
    return -1;
  }

  function showTimes() {
    items.forEach(function (item, i) {
      var time = part(item, ".ab-time");
      if (time && i !== cur) time.textContent = fmt(clipOf(item).len);
    });
    if ($("abPlayAll")) {
      var mine = items.some(function (item) { return !item.hidden && picked(item); });
      $("abPlayAllText").textContent = mine ? "Play picked" : "Play all";
      $("abClear").hidden = !mine;
    }
  }

  function ui() {
    var playing = cur >= 0 && !au.paused && !items[cur].classList.contains("is-unavailable");
    items.forEach(function (item, i) {
      item.classList.toggle("is-current", i === cur);
      item.classList.toggle("is-playing", i === cur && playing);
      item.classList.toggle("is-picked", picked(item));
      part(item, ".ab-play").setAttribute("aria-label", (i === cur && playing ? "Pause " : "Play ") + item.dataset.title);
    });
    bar.classList.toggle("is-playing", playing);
    $("abToggle").setAttribute("aria-label", playing ? "Pause" : "Play");
    $("abPrev").disabled = cur < 0;
    $("abNext").disabled = step(1) < 0;
  }

  function progress() {
    if (cur < 0) return;
    var d = au.duration || clipOf(items[cur]).len, t = au.currentTime;
    var line = part(items[cur], ".ab-line span"), time = part(items[cur], ".ab-time");
    if (line) line.style.width = (d ? (t / d) * 100 : 0) + "%";
    if (time) time.textContent = fmt(t) + " / " + fmt(d);
    $("abAt").textContent = fmt(t);
    $("abLen").textContent = fmt(d);
    if (!dragging) seek.value = d ? Math.round((t / d) * 1000) : 0;
    [25, 50, 75].forEach(function (m) {
      if (au.duration && !marks[m] && t / d >= m / 100) {
        marks[m] = true;
        track("audio_progress", { percent: m });
      }
    });
  }

  // Loads post i in the chosen model and voice, starting at a fraction of the way through (used when either changes mid-post).
  // how says what started it ("list", "play_all", "next", "previous" or "autoplay"), for the audio_play event.
  function load(i, at, play, how) {
    clearTimeout(nextTimer);
    if (i !== cur) marks = {};
    var old = cur >= 0 && cur !== i && part(items[cur], ".ab-line span");
    if (old) old.style.width = "0";
    cur = i;
    var item = items[i], clip = clipOf(item);
    readerLoad(how);
    au.src = item.dataset.audio + clip.model + "/" + clip.voice + ".mp3";
    au.defaultPlaybackRate = au.playbackRate = rate;
    if (at) au.addEventListener("loadedmetadata", function () { au.currentTime = at * au.duration; }, { once: true });
    $("abNow").textContent = item.dataset.title;
    // The voice and model are named only when the page offers a choice of them.
    $("abNowVoice").textContent = bar.dataset.label === "false" ? "" : (VOICES[clip.voice] || clip.voice) + " · " + clip.model;
    bar.hidden = false;
    document.body.classList.add("ab-has-bar");
    showTimes();
    progress();
    if (play !== false) au.play().catch(ui);
    ui();
    if (how) track("audio_play", { trigger: how });
    if ("mediaSession" in navigator && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: item.dataset.title, artist: "Prashish", album: "Audiobook · prashish.xyz" });
    }
  }

  // A clip that fails to load (the bucket or the network is down) dims its post and stops there, rather than trying the
  // next post, which usually fails the same way. Pressing a dimmed post tries it again.
  function unavailable() {
    if (cur < 0 || items[cur].classList.contains("is-unavailable")) return;
    clearTimeout(nextTimer);
    items[cur].classList.add("is-unavailable");
    part(items[cur], ".ab-play").title = "Audio unavailable right now, press to try again";
    $("abNowVoice").textContent = "Audio unavailable right now";
    track("audio_error");
    ui();
  }

  // fromRow is true for a play button in a list or a Listen row, which also brings the read-along view back after it was closed.
  function toggle(i, fromRow) {
    if (items[i].classList.contains("is-unavailable")) {
      items[i].classList.remove("is-unavailable");
      part(items[i], ".ab-play").removeAttribute("title");
      return load(i, 0, true, "retry");
    }
    if (i !== cur) return load(i, 0, true, "list");
    if (au.paused) {
      au.play().catch(ui);
      if (fromRow && hasWords(i) && !readerOpen) openReader(true);
    } else au.pause();
  }
  function prev() {
    var i = step(-1);
    if (i >= 0 && au.currentTime < 3) load(i, 0, true, "previous");
    else if (cur >= 0) { au.currentTime = 0; if (au.paused) au.play().catch(ui); }
  }
  function next(how) {
    var i = step(1);
    if (i >= 0) load(i, 0, true, typeof how === "string" ? how : "next");
  }

  function setRate(r) {
    rate = r;
    au.defaultPlaybackRate = au.playbackRate = r;
    $("abRate").textContent = r + "×";
    $("abRate").setAttribute("aria-label", "Playback speed, " + r + "×");
    try { localStorage.setItem("audiobook-speed", String(r)); } catch (e) {}
    track("audio_speed", { speed: r });
  }
  function setModel(m) {
    model = m;
    modelBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.model === m)); });
    try { localStorage.setItem("audiobook-model", m); } catch (e) {}
  }
  // Shows the posts in the chosen topic, and with the Popular filter only those in data/popular.yaml.
  function filter() {
    var popular = $("abShow") && $("abShow").value === "popular";
    items.forEach(function (item) { item.hidden = (!!topic && item.dataset.topic !== topic) || (popular && !item.dataset.popular); });
    if ($("abEmpty")) $("abEmpty").hidden = items.some(function (item) { return !item.hidden; });
    showTimes();
    ui();
  }
  function setAuto(on) {
    auto = on;
    autoBtn.setAttribute("aria-pressed", String(on));
    try { localStorage.setItem("audiobook-autoplay", on ? "1" : "0"); } catch (e) {}
  }
  function setTopic(t) {
    topic = t;
    topics.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.topic === t)); });
    filter();
  }
  // Changing voice or model mid-post keeps the place, so the same sentence can be heard both ways.
  function reloadCurrent() {
    if (cur >= 0) load(cur, au.ended || !au.duration ? 0 : au.currentTime / au.duration, !au.paused);
    else showTimes();
  }

  // The read-along view: the post's words, lit up as they are spoken. The words and their timings come from
  // <clip>.words.json, made by scripts/narrate-post.mjs, and only posts marked data-words have them.
  var reader = $("abReader"), readerOpen = false, rw = null, rwUrl = "", rwPast = -1, rwNow = -2, rwPausedUntil = 0, rwFrame = 0, wordsCache = {};
  function hasWords(i) { return i >= 0 && items[i].dataset.words === "1"; }
  function wordsUrl(item) { var c = clipOf(item); return item.dataset.audio + c.model + "/" + c.voice + ".words.json?v=2"; } // v=2 skips copies browsers saved before the bucket allowed the site to read them
  // Called whenever a post is loaded: offers the view for posts that have it, fills it again when it is open, and opens it when
  // the post was started by pressing play (not when the next post follows on by itself). Closing it returns to the page below.
  function readerLoad(how) {
    var can = hasWords(cur);
    $("abRead").hidden = !can;
    if (readerOpen) { if (can) buildReader(); else closeReader(); }
    else if (can && (how === "list" || how === "retry" || how === "play_all")) openReader(true);
  }
  function buildReader() {
    var item = items[cur], url = wordsUrl(item), box = $("abReaderText");
    $("abReaderTitle").textContent = item.dataset.title;
    $("abReaderTag").textContent = item.dataset.tag || "";
    box.textContent = ""; rw = null; rwUrl = url;
    (wordsCache[url] ? Promise.resolve(wordsCache[url]) : fetch(url).then(function (r) { if (!r.ok) throw new Error("words"); return r.json(); }).then(function (j) { wordsCache[url] = j; return j; }))
      .then(function (j) {
        if (rwUrl !== url) return; // another post was loaded in the meantime
        var spans = [], times = [];
        j.p.forEach(function (para) {
          var p = document.createElement("p");
          para.forEach(function (w, k) {
            var sp = document.createElement("span");
            sp.className = "w"; sp.dataset.i = spans.length; sp.textContent = w[0];
            p.appendChild(sp);
            if (k < para.length - 1) p.appendChild(document.createTextNode(" "));
            spans.push(sp); times.push(w);
          });
          box.appendChild(p);
        });
        rw = { spans: spans, times: times };
        reader.scrollTop = 0; rwPast = -1; rwNow = -2;
        paintReader();
      })
      .catch(function () { box.textContent = "The read-along text is not available right now."; });
  }
  // Marks the words before the current time as spoken and the one being spoken as current, touching only the words that changed.
  function paintReader() {
    if (!rw || !readerOpen) return;
    var T = rw.times, t = au.currentTime, lo = 0, hi = T.length - 1, idx = -1;
    while (lo <= hi) { var mid = (lo + hi) >> 1; if (T[mid][1] <= t) { idx = mid; lo = mid + 1; } else hi = mid - 1; }
    var now = idx >= 0 && t < T[idx][2] ? idx : -1, past = now >= 0 ? idx : idx + 1;
    if (past === rwPast && now === rwNow) return;
    var first = rwPast < 0 ? 0 : Math.min(past, rwPast) - 1, last = rwPast < 0 ? T.length - 1 : Math.max(past, rwPast) + 1;
    for (var i = Math.max(0, first); i <= Math.min(T.length - 1, last); i++) rw.spans[i].className = "w" + (i < past ? " past" : i === now ? " now" : "");
    rwPast = past; rwNow = now;
    // Keep the spoken line in the middle of the screen, unless the reader has just scrolled by hand.
    if (Date.now() < rwPausedUntil) return;
    var el = rw.spans[now >= 0 ? now : Math.max(0, past - 1)], box = el.getBoundingClientRect(), vh = window.innerHeight - 90;
    if (box.top < vh * 0.25 || box.bottom > vh * 0.6) reader.scrollTo({ top: reader.scrollTop + box.top - vh * 0.4, behavior: "smooth" });
  }
  function readerLoop() {
    cancelAnimationFrame(rwFrame);
    (function tick() { paintReader(); rwFrame = requestAnimationFrame(tick); })();
  }
  function openReader(auto) {
    if (!hasWords(cur)) return;
    readerOpen = true; reader.hidden = false;
    document.body.classList.add("ab-reading");
    $("abRead").setAttribute("aria-pressed", "true");
    buildReader(); readerLoop();
    track("reader_open", { trigger: auto ? "play" : "button" });
    if (!auto) $("abReaderClose").focus();
  }
  function closeReader() {
    readerOpen = false; reader.hidden = true;
    document.body.classList.remove("ab-reading");
    $("abRead").setAttribute("aria-pressed", "false");
    cancelAnimationFrame(rwFrame);
  }
  $("abRead").addEventListener("click", function () { if (readerOpen) closeReader(); else openReader(); });
  $("abReaderClose").addEventListener("click", closeReader);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && readerOpen) closeReader(); });
  ["wheel", "touchstart"].forEach(function (n) { reader.addEventListener(n, function () { rwPausedUntil = Date.now() + 4000; }, { passive: true }); });
  // Pressing a word plays from there.
  reader.addEventListener("click", function (e) {
    var w = e.target.closest && e.target.closest(".w");
    if (!w || !rw) return;
    au.currentTime = rw.times[+w.dataset.i][1];
    rwPausedUntil = 0;
    if (au.paused) au.play().catch(ui);
  });

  items.forEach(function (item, i) {
    part(item, ".ab-play").addEventListener("click", function () { toggle(i, true); });
    var box = part(item, ".ab-pick input");
    if (box) box.addEventListener("change", function () { showTimes(); ui(); });
    // The progress line under the playing post seeks too: press or drag along it.
    var line = part(item, ".ab-line");
    if (!line) return;
    function seekTo(e) {
      var r = line.getBoundingClientRect();
      if (au.duration) au.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * au.duration;
    }
    line.addEventListener("pointerdown", function (e) {
      if (i !== cur) { if (item.classList.contains("ab-listen")) toggle(i); return; } // pressing the dim track on a post that is not playing starts it
      line.setPointerCapture(e.pointerId);
      seekTo(e);
    });
    line.addEventListener("pointermove", function (e) { if (line.hasPointerCapture(e.pointerId)) seekTo(e); });
  });
  topics.forEach(function (b) { b.addEventListener("click", function () { setTopic(b.dataset.topic); }); });
  modelBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      setModel(b.dataset.model);
      reloadCurrent();
      track("audio_model_change", { model: b.dataset.model });
    });
  });
  if ($("abShow")) $("abShow").addEventListener("change", filter);
  if (voiceSel) voiceSel.addEventListener("change", function () {
    voice = voiceSel.value;
    try { localStorage.setItem("audiobook-voice", voice); } catch (e) {}
    reloadCurrent();
    track("audio_voice_change", { voice: voice });
  });
  if ($("abPlayAll")) {
    $("abPlayAll").addEventListener("click", function () {
      if (queue().length) load(items.indexOf(queue()[0]), 0, true, "play_all");
    });
    $("abClear").addEventListener("click", function () {
      items.forEach(function (item) { part(item, ".ab-pick input").checked = false; });
      showTimes();
      ui();
    });
  }
  $("abRate").addEventListener("click", function () { setRate(RATES[(RATES.indexOf(rate) + 1) % RATES.length]); });
  autoBtn.addEventListener("click", function () { setAuto(!auto); });
  $("abToggle").addEventListener("click", function () { toggle(cur); });
  $("abPrev").addEventListener("click", prev);
  $("abNext").addEventListener("click", next);

  seek.addEventListener("input", function () {
    dragging = true;
    if (au.duration) $("abAt").textContent = fmt((seek.value / 1000) * au.duration);
  });
  seek.addEventListener("change", function () {
    dragging = false;
    if (au.duration) au.currentTime = (seek.value / 1000) * au.duration;
  });

  au.addEventListener("play", ui);
  au.addEventListener("pause", ui);
  au.addEventListener("timeupdate", progress);
  au.addEventListener("loadedmetadata", progress);
  au.addEventListener("error", unavailable);
  au.addEventListener("ended", function () {
    track("audio_complete");
    if (auto && step(1) >= 0) nextTimer = setTimeout(function () { next("autoplay"); }, 1200);
    ui();
  });

  if ("mediaSession" in navigator) {
    var actions = {
      play: function () { au.play(); },
      pause: function () { au.pause(); },
      previoustrack: prev,
      nexttrack: next,
      seekto: function (d) { au.currentTime = d.seekTime; },
    };
    Object.keys(actions).forEach(function (a) {
      try { navigator.mediaSession.setActionHandler(a, actions[a]); } catch (e) {}
    });
  }

  setRate(rate);
  setAuto(auto);
  if (modelBtns.length) setModel(model);
  showTimes();
  ui();
})();

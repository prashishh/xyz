// Player for /audiobook. Each .ab-item carries its audio folder and the length of each clip by model and voice;
// the clip itself is <folder><model>/<voice>.mp3, made by scripts/narrate-post.mjs.
// The queue is the posts shown under the topic filter, narrowed to the picked ones when any are picked.
(function () {
  var items = [].slice.call(document.querySelectorAll(".ab-item"));
  if (!items.length) return;
  var $ = function (id) { return document.getElementById(id); };
  var voiceSel = $("abVoice"), autoBtn = $("abAuto"), bar = $("abBar"), seek = $("abSeek");
  var topics = [].slice.call(document.querySelectorAll(".ab-topic"));
  var modelBtns = [].slice.call(document.querySelectorAll(".ab-model button"));
  var RATES = [1, 1.5, 2];
  var au = new Audio();
  var cur = -1, rate = 1, auto = true, model = document.querySelector(".ab-list").dataset.model, nextTimer = 0, dragging = false;
  au.preload = "metadata";

  try {
    var saved = localStorage.getItem("audiobook-voice");
    if (saved && voiceSel.querySelector('option[value="' + saved + '"]')) voiceSel.value = saved;
    if (localStorage.getItem("audiobook-autoplay") === "0") auto = false;
    rate = RATES.indexOf(Number(localStorage.getItem("audiobook-speed"))) >= 0 ? Number(localStorage.getItem("audiobook-speed")) : 1;
    var savedModel = localStorage.getItem("audiobook-model");
    if (modelBtns.some(function (b) { return b.dataset.model === savedModel; })) model = savedModel;
  } catch (e) {}

  function fmt(t) {
    t = Math.max(0, Math.round(t || 0));
    return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0");
  }
  function seconds(item) { return JSON.parse(item.dataset.seconds); }
  // The chosen model and voice, or for a post missing them, the first model and voice it has.
  function clipOf(item) {
    var s = seconds(item), m = s[model] ? model : Object.keys(s)[0];
    var v = s[m][voiceSel.value] ? voiceSel.value : Object.keys(s[m])[0];
    return { model: m, voice: v, len: s[m][v] };
  }
  function voiceName(key) {
    var o = voiceSel.querySelector('option[value="' + key + '"]');
    return o ? o.textContent : key;
  }
  function picked(item) { return item.querySelector(".ab-pick input").checked; }

  function queue() {
    var shown = items.filter(function (item) { return !item.hidden; });
    var mine = shown.filter(picked);
    return mine.length ? mine : shown;
  }
  // The next post in the queue after the current one, in list order, so it works even when the current post is not in the queue.
  function step(dir) {
    var q = queue(), order = dir > 0 ? q : q.slice().reverse();
    for (var i = 0; i < order.length; i++) {
      var at = items.indexOf(order[i]);
      if (dir > 0 ? at > cur : at < cur) return at;
    }
    return -1;
  }

  function showTimes() {
    var mine = items.some(function (item) { return !item.hidden && picked(item); });
    items.forEach(function (item, i) {
      if (i !== cur) item.querySelector(".ab-time").textContent = fmt(clipOf(item).len);
    });
    $("abPlayAllText").textContent = mine ? "Play picked" : "Play all";
    $("abClear").hidden = !mine;
  }

  function ui() {
    var playing = cur >= 0 && !au.paused;
    items.forEach(function (item, i) {
      item.classList.toggle("is-current", i === cur);
      item.classList.toggle("is-playing", i === cur && playing);
      item.classList.toggle("is-picked", picked(item));
      item.querySelector(".ab-play").setAttribute("aria-label", (i === cur && playing ? "Pause " : "Play ") + item.dataset.title);
    });
    bar.classList.toggle("is-playing", playing);
    $("abToggle").setAttribute("aria-label", playing ? "Pause" : "Play");
    $("abPrev").disabled = cur < 0;
    $("abNext").disabled = step(1) < 0;
  }

  function progress() {
    if (cur < 0) return;
    var d = au.duration || clipOf(items[cur]).len, t = au.currentTime;
    items[cur].querySelector(".ab-line span").style.width = (d ? (t / d) * 100 : 0) + "%";
    items[cur].querySelector(".ab-time").textContent = fmt(t) + " / " + fmt(d);
    $("abAt").textContent = fmt(t);
    $("abLen").textContent = fmt(d);
    if (!dragging) seek.value = d ? Math.round((t / d) * 1000) : 0;
  }

  // Loads post i in the chosen model and voice, starting at a fraction of the way through (used when either changes mid-post).
  function load(i, at, play) {
    clearTimeout(nextTimer);
    if (cur >= 0 && cur !== i) items[cur].querySelector(".ab-line span").style.width = "0";
    cur = i;
    var item = items[i], clip = clipOf(item);
    au.src = item.dataset.audio + clip.model + "/" + clip.voice + ".mp3";
    au.defaultPlaybackRate = au.playbackRate = rate;
    if (at) au.addEventListener("loadedmetadata", function () { au.currentTime = at * au.duration; }, { once: true });
    $("abNow").textContent = item.dataset.title;
    $("abNowVoice").textContent = voiceName(clip.voice) + " · " + clip.model;
    bar.hidden = false;
    document.body.classList.add("ab-has-bar");
    showTimes();
    progress();
    if (play !== false) au.play().catch(ui);
    ui();
    if ("mediaSession" in navigator && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: item.dataset.title, artist: "Prashish", album: "Audiobook · prashish.xyz" });
    }
  }

  function toggle(i) {
    if (i !== cur) return load(i);
    if (au.paused) au.play().catch(ui);
    else au.pause();
  }
  function prev() {
    var i = step(-1);
    if (i >= 0 && au.currentTime < 3) load(i);
    else if (cur >= 0) { au.currentTime = 0; if (au.paused) au.play().catch(ui); }
  }
  function next() {
    var i = step(1);
    if (i >= 0) load(i);
  }

  function setRate(r) {
    rate = r;
    au.defaultPlaybackRate = au.playbackRate = r;
    $("abRate").textContent = r + "×";
    $("abRate").setAttribute("aria-label", "Playback speed, " + r + "×");
    try { localStorage.setItem("audiobook-speed", String(r)); } catch (e) {}
  }

  function setModel(m) {
    model = m;
    modelBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.model === m)); });
    try { localStorage.setItem("audiobook-model", m); } catch (e) {}
  }

  function setTopic(topic) {
    topics.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.topic === topic)); });
    items.forEach(function (item) { item.hidden = !!topic && item.dataset.topic !== topic; });
    showTimes();
    ui();
  }

  items.forEach(function (item, i) {
    item.querySelector(".ab-play").addEventListener("click", function () { toggle(i); });
    item.querySelector(".ab-pick input").addEventListener("change", function () { showTimes(); ui(); });
  });
  topics.forEach(function (b) { b.addEventListener("click", function () { setTopic(b.dataset.topic); }); });
  modelBtns.forEach(function (b) { b.addEventListener("click", function () { setModel(b.dataset.model); reloadCurrent(); }); });
  $("abRate").addEventListener("click", function () { setRate(RATES[(RATES.indexOf(rate) + 1) % RATES.length]); });
  $("abPlayAll").addEventListener("click", function () { load(items.indexOf(queue()[0])); });
  $("abClear").addEventListener("click", function () {
    items.forEach(function (item) { item.querySelector(".ab-pick input").checked = false; });
    showTimes();
    ui();
  });
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
  au.addEventListener("ended", function () {
    if (auto && step(1) >= 0) nextTimer = setTimeout(next, 1200);
    ui();
  });

  // Changing voice or model mid-post keeps the place, so the same sentence can be heard both ways.
  function reloadCurrent() {
    if (cur >= 0) load(cur, au.ended || !au.duration ? 0 : au.currentTime / au.duration, !au.paused);
    else showTimes();
  }
  voiceSel.addEventListener("change", function () {
    try { localStorage.setItem("audiobook-voice", voiceSel.value); } catch (e) {}
    reloadCurrent();
  });
  function setAuto(on) {
    auto = on;
    autoBtn.setAttribute("aria-pressed", String(on));
    try { localStorage.setItem("audiobook-autoplay", on ? "1" : "0"); } catch (e) {}
  }
  autoBtn.addEventListener("click", function () { setAuto(!auto); });

  // The progress line under the playing post seeks too: press or drag along it.
  items.forEach(function (item, i) {
    var line = item.querySelector(".ab-line");
    function seekTo(e) {
      var r = line.getBoundingClientRect();
      if (au.duration) au.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * au.duration;
    }
    line.addEventListener("pointerdown", function (e) {
      if (i !== cur) return;
      line.setPointerCapture(e.pointerId);
      seekTo(e);
    });
    line.addEventListener("pointermove", function (e) { if (line.hasPointerCapture(e.pointerId)) seekTo(e); });
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

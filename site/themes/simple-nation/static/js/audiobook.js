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

  // A clip that fails to load (the bucket or the network is down) dims its post, and autoplay moves on.
  function unavailable() {
    if (cur < 0 || items[cur].classList.contains("is-unavailable")) return;
    items[cur].classList.add("is-unavailable");
    part(items[cur], ".ab-play").title = "Audio unavailable right now";
    $("abNowVoice").textContent = "Audio unavailable right now";
    track("audio_error");
    if (auto && step(1) >= 0) nextTimer = setTimeout(function () { next("autoplay"); }, 1200);
    ui();
  }

  function toggle(i) {
    if (items[i].classList.contains("is-unavailable")) return;
    if (i !== cur) return load(i, 0, true, "list");
    if (au.paused) au.play().catch(ui);
    else au.pause();
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

  items.forEach(function (item, i) {
    part(item, ".ab-play").addEventListener("click", function () { toggle(i); });
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
      if (i !== cur) return;
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

---
title: Talk
date: 2026-10-03T00:00:00+05:30
author: Prashish
# Shared by link only: not in the nav or lists, and kept out of search engines.
noindex: true
---

A test: talk with an AI built from my essays and fragments. My cloned voice speaks as me, and Pragya's speaks on my behalf. It understands English and Nepali, and each call runs up to five minutes.

<div class="talk-voices" role="group" aria-label="Voice">
  <button type="button" data-agent="agent_8301m408xs6cese9t4cpmpdx9dte" aria-pressed="true">Prashish</button>
  <button type="button" data-agent="agent_8001m40z9mt1ecm9kg828jdkbp0c" aria-pressed="false">Pragya</button>
</div>

<div id="talk-widget"><elevenlabs-convai agent-id="agent_8301m408xs6cese9t4cpmpdx9dte"></elevenlabs-convai></div>
<script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
<script>
// Swaps the widget for the chosen voice's agent, since the widget does not pick up a changed agent-id.
document.querySelectorAll(".talk-voices button").forEach(function (b) {
  b.addEventListener("click", function () {
    document.querySelectorAll(".talk-voices button").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
    document.getElementById("talk-widget").innerHTML = '<elevenlabs-convai agent-id="' + b.dataset.agent + '"></elevenlabs-convai>';
  });
});
</script>

<style>
.talk-voices { display: inline-flex; margin: 8px 0 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif; }
.talk-voices button { font: inherit; font-size: 14px; color: var(--text-color); background: none; border: 1px solid var(--border-color); padding: 6px 16px; margin-left: -1px; cursor: pointer; }
.talk-voices button:first-child { border-radius: 999px 0 0 999px; }
.talk-voices button:last-child { border-radius: 0 999px 999px 0; }
.talk-voices button[aria-pressed="true"] { background: var(--accent-color); border-color: var(--accent-color); color: #fff; }
</style>

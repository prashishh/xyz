---
title: Inner Divinity
date: 2026-10-24T00:00:00+05:30
author: Prashish
description: "a glimpse outside, a light within"
article_kind: Spiritual
---

During festivals, I always observe very long lines outside temples. Everyone is waiting, and people move with great enthusiasm and faith to take a small glimpse of "god" before being asked to move forward. The same usually happens in most faith-based religions, as people search for divinity.

{{< walkthrough src="/scenes/the-line.html" title="Inner divinity" height="72vh" >}}

In the scene, each of us carries the inner light, and only when we look really deeply inside does the light appear.

<div id="place-quote" style="text-align:center">
<blockquote><em>Tat Tvam Asi</em>: “You are That.” (Chandogya Upanishad 6.8.7)</blockquote>
<blockquote hidden>“The kingdom of God is within you.” (Luke 17:21)</blockquote>
<blockquote hidden>“We are closer to him than his jugular vein.” (Qur’an 50:16)</blockquote>
<blockquote hidden>“Be a lamp unto yourself.” (The Buddha, Mahaparinibbana Sutta)</blockquote>
</div>
<script>
// the four quotes take turns, whichever place the scene is showing
(function () {
  var box = document.getElementById('place-quote'), items = box.querySelectorAll('blockquote'), at = 0;
  Array.prototype.forEach.call(items, function (q) { q.style.margin = '0 auto'; q.style.border = '0'; q.style.transition = 'opacity .3s'; });
  setInterval(function () {
    var from = items[at]; from.style.opacity = 0;
    setTimeout(function () {
      from.hidden = true; at = (at + 1) % items.length;
      var to = items[at]; to.style.opacity = 0; to.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { to.style.opacity = 1; }); });
    }, 300);
  }, 4200);
})();
</script>

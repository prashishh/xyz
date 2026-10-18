---
title: "A Daily AI Briefing That Researches, Checks and Posts on Its Own"
date: 2026-10-17T00:00:00Z
author: Prashish
tags:
  - ai
  - agents
  - automation
  - research
description: "reads 50+ sources, checks every story, and posts across social media on its own"
article_kind: Technical
cover: /img/ai-atlas-og.png
---

<style>
.aab{
  --aab-ink:var(--text-color); --aab-muted:var(--text-color-muted);
  --aab-rule:var(--border-color-light); --aab-page:var(--bg-color);
  --aab-agent:#1266d6; --aab-agent-soft:#dce9fb; --aab-gate:#b5700e;
  --aab-gate-soft:#f7e7cd;
  margin:40px 0 34px; font-family:inherit;
}
.aab svg{display:block;width:100%;height:auto;overflow:visible}
.aab-cap{font-size:.86rem;color:var(--aab-muted);margin:14px 0 0;text-align:center;font-style:italic}
.aab-lab{font-size:13px;fill:var(--aab-muted);font-family:inherit}
.aab-key{font-size:16px;fill:var(--aab-ink);font-family:inherit;font-weight:600}
.aab-hint{font-size:13px;fill:var(--aab-muted);font-family:inherit;font-style:italic}
.aab-lane{font-size:12px;fill:var(--aab-muted);font-family:inherit;letter-spacing:.06em;text-transform:uppercase}
.aab-shots{display:flex;flex-direction:row;align-items:flex-start;gap:10px;overflow-x:auto;scroll-snap-type:x proximity;margin:28px 0 0;padding-bottom:8px}
.aab-shot{flex:0 0 auto;display:block;width:300px;height:auto;scroll-snap-align:start;border:1px solid var(--aab-rule);border-radius:8px}
.ad-bw{fill:var(--aab-agent-soft);opacity:.55}
.ad-bc{fill:var(--aab-gate-soft);opacity:.7}
.ad-path{fill:none;stroke:var(--aab-ink);stroke-opacity:.3;stroke-width:3;stroke-linecap:round}
.ad-w{fill:var(--aab-agent)}
.ad-c{fill:var(--aab-gate)}
.ad-k{fill:var(--aab-ink)}
[data-theme="dark"] .aab{
  --aab-agent:#69a8f5; --aab-agent-soft:#1b2f47; --aab-gate:#e0a458;
  --aab-gate-soft:#392812;
}
</style>

> **Note**: This article is part of an ongoing AI-assisted development series (/ai). The system it describes was built with AI assistance, and so was this write-up.

**[AI Atlas](https://atlas.prashish.com/)** is a website that keeps you up to date on AI news. Every night it reads 50+ sources across the web, checks each story against where it came from, and writes a short daily brief that goes out as a web page, an email, an audio recording and automatic posts on social media throughout the day. You can find the accounts on [Threads](https://www.threads.com/@aiatlasresearch), [Bluesky](https://bsky.app/profile/aiatlasresearch.bsky.social), [Instagram](https://www.instagram.com/aiatlasresearch/), [X](https://x.com/aiatlasresearch) and [LinkedIn](https://www.linkedin.com/company/ai-atlas-research/) so far, and more will be added in the future.

I have been running this as an experiment for a week, and close to 100 posts go out across social media, from images and carousels to video. The goal is to find out whether posting across social media can run on its own, so a brief goes out without anyone reviewing it first. Every step therefore has its own check, and the entire AI Atlas system follows one rule, which is to keep only what the sources back up.

### The nightly run goes through these steps:

- **Collects** items from 50+ sources across the web (lab blogs, changelogs, model lists, papers, news) and keeps only what is new since the last run
- **Triages** about 140 items down to about 30, groups items about the same story and scores each one from 1 to 5
- **Researches** each remaining story from its primary pages and writes one record with its sources, with a second researcher on the day's biggest stories
- **Checks** every record against its source pages and settles disagreements
- **Writes** the day's brief with a short summary at the top
- **Checks the writing** claim by claim and removes what is wrong
- **Publishes** the site, the email, the audio and the social posts

---

<div class="aab" id="fig-arch">
  <svg viewBox="0 0 960 350" role="img" aria-label="A path from sources through triage, research, a record check, writing the brief and a writing check to publishing. Triage, research and writing sit in the writer models lane, and the two checks sit in a separate checker models lane, so the path alternates between the lanes.">
    <rect class="ad-bw" x="100" y="40" width="690" height="110" rx="16"/>
    <rect class="ad-bc" x="100" y="190" width="690" height="110" rx="16"/>
    <text class="aab-lane" x="118" y="62">Writer models</text>
    <text class="aab-lane" x="118" y="212">Checker models, a separate list</text>
    <path class="ad-path" d="M40 165 C75 165,130 80,170 80 H300 C365 80,365 230,430 230 C495 230,495 80,560 80 C625 80,625 230,690 230 C760 230,800 165,880 165"/>
    <circle class="ad-k" cx="40" cy="165" r="8"/>
    <text class="aab-key" x="0" y="196">Sources</text>
    <text class="aab-hint" x="0" y="214">50+ across</text>
    <text class="aab-hint" x="0" y="230">the web</text>
    <circle class="ad-w" cx="170" cy="80" r="10"/>
    <text class="aab-key" x="170" y="114" text-anchor="middle">Triage</text>
    <text class="aab-hint" x="170" y="132" text-anchor="middle">about 30 stories</text>
    <circle class="ad-w" cx="300" cy="80" r="10"/>
    <text class="aab-key" x="300" y="114" text-anchor="middle">Research</text>
    <text class="aab-hint" x="300" y="132" text-anchor="middle">primary pages</text>
    <circle class="ad-c" cx="430" cy="230" r="10"/>
    <text class="aab-key" x="430" y="264" text-anchor="middle">Check records</text>
    <text class="aab-hint" x="430" y="282" text-anchor="middle">against sources</text>
    <circle class="ad-w" cx="560" cy="80" r="10"/>
    <text class="aab-key" x="560" y="114" text-anchor="middle">Write</text>
    <text class="aab-hint" x="560" y="132" text-anchor="middle">the day's brief</text>
    <circle class="ad-c" cx="690" cy="230" r="10"/>
    <text class="aab-key" x="690" y="264" text-anchor="middle">Check writing</text>
    <text class="aab-hint" x="690" y="282" text-anchor="middle">claim by claim</text>
    <circle class="ad-k" cx="880" cy="165" r="8"/>
    <text class="aab-key" x="880" y="196" text-anchor="middle">Publish</text>
    <text class="aab-hint" x="880" y="214" text-anchor="middle">web, email,</text>
    <text class="aab-hint" x="880" y="230" text-anchor="middle">audio, social</text>
  </svg>
  <p class="aab-cap">The path from sources to publishing alternates between writer models and a separate list of checker models.</p>
</div>

---

## Writers and Checkers

Writing and checking use separate lists of models, so the model that wrote a record never checks it. One writing style guide applies across the whole system, from the briefs to the social posts.

| What runs | Cost per night |
| --- | --- |
| Model calls, writers and checkers | about $2 of API value, covered by the API keys |
| Second researcher on the biggest stories | about $0.30 in cash |
| X usage fees | about $0.10 to $0.15 |
| Voice narration | free credits |

---

## Everything Goes Through a Checker

A researcher model reads the original pages, such as the lab's announcement, model card, paper or changelog, and writes each record from those pages only. For the biggest stories, a second model researches the same story on its own, so the two accounts can be compared and any difference points to a possible mistake. The system then matches the name, the date and every number against the pages the record cites. Finally, a checking model from the separate list reads those pages, decides which version is right, fixes any errors and labels anything it cannot confirm.

Every record in the [daily atlas](https://atlas.prashish.com/daily/) shows its figures, who measured each one, its sources and the date it was checked. Each also carries a label for how well its sources held up, either checked, corrected, partly confirmed or not yet confirmed. The short items under Also in the news are worded as reported and have not been checked the same way, and the [How we check](https://atlas.prashish.com/how-we-check/) page explains the whole process.

<div class="aab-shots">
  <img class="aab-shot" src="/img/ai-atlas-record-1.jpg" alt="The top of an AI Atlas record page for a model release, with the headline, a plain summary, and the date, lab, kind and access of the release">
  <img class="aab-shot" src="/img/ai-atlas-record-2.jpg" alt="The figures table of the same record page, listing each measure, its value and who measured it, followed by a note on what the sources leave unclear">
  <img class="aab-shot" src="/img/ai-atlas-record-3.jpg" alt="The bottom of the same record page, with the source link, the line stating the record was checked against its sources on 16 October 2026, and sharing and report a mistake links">
</div>

<p class="aab-cap">A record page from top to bottom, with each figure and who measured it, the source, and the date it was checked.</p>

---

## What Gets Published

The day's brief goes out as a page on the website, with a short summary at the top, the stories and a link to every record, and the same brief arrives as a daily email.

<div class="aab-shots">
  <img class="aab-shot" src="/img/ai-atlas-site-1.jpg" alt="The top of the AI Atlas daily page, with the In short summary and the day's main stories">
  <img class="aab-shot" src="/img/ai-atlas-site-2.jpg" alt="The middle of the AI Atlas daily page, with the Also in the news list, sharing links and the email signup">
  <img class="aab-shot" src="/img/ai-atlas-site-3.jpg" alt="The bottom of the AI Atlas daily page, with the launches and products from the day">
  <img class="aab-shot" src="/img/ai-atlas-email.jpg" alt="The daily email from AI Atlas, with the headline, the In short summary and the start of the first story">
</div>

<p class="aab-cap">The daily page on the website from top to bottom, followed by the same brief as the daily email.</p>

---

## From the Brief to Social Media

After the email goes out, the system picks the day's stories from the brief, each with its own angle (plain, number first, person first, context first, open end, three facts) so the wording varies. A post may only use numbers that appear in that day's brief, and a story with any other number is left out, while each story gets a photo from a pool of stock photos.

Next it draws a card per story, builds a carousel, makes videos with music from a library of tracks generated once, and schedules the day's posts through a self-hosted scheduler (Postiz). A morning wave covers Europe and Asia, and the rest follows New York time.

---

## The Feedback Loop

Every few days, a run collects the stats and interactions from each social network. The numbers then guide changes such as more posts on one network, a new posting schedule or more highlights. Threads got 4,500 views in the first few days, so the system automatically added more posts there, and I guide it from time to time.

---

## Where This Stands

The aim is software that runs from start to finish on its own and also fixes itself when something breaks. [Self-Healing Software](/ai/self-healing-software/) covers the fixing half, and this post shares how the running half works so far.

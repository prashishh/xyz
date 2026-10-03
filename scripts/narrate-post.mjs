#!/usr/bin/env node
// Reads a post aloud with ElevenLabs for the /audiobook page.
//
//   ELEVENLABS_API_KEY=... npm run narrate:post -- site/content/fragments/world-class-network.md
//   ELEVENLABS_API_KEY=... npm run narrate:post -- <post.md> --model v4 --voice prashish1
//   npm run narrate:post -- <post.md> --dry     prints the text that would be read, without calling ElevenLabs
//
// Each model and voice gets one clip, site/static/audio/<section>/<post>/<model>/<voice>.mp3, that reads the title and then the body.
// Without --model or --voice the post is read with every model and voice below, so they can be compared on the same text.
// site/data/audiobook.json lists the narrated posts with the length of each clip, and the /audiobook page is built from it.
// Re-run it after editing the post. Clips whose text and settings are unchanged are skipped.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

// To add a voice, add an entry with its ElevenLabs voice ID. The page lists voices in this order.
// Each speed brings that clone to roughly the same pace on v2, about 180 words a minute, since Sample 2 reads slowest.
// "Prashish Prof Sample 1" (fssCo3YifsnG73ZibFEt) can be added once ElevenLabs finishes training it.
const VOICES = {
  prashish1: { id: "8wsU7HB5OdbweujOpdg8", name: "Prashish Sample 1", speed: 1.0 }, // "Prashish Sample" clone
  prashish2: { id: "bgNm9pp0UvhCbGbheCIV", name: "Prashish Sample 2", speed: 1.1 },
  prashish3: { id: "1BhQhNmwjgIhYHkStoq6", name: "Prashish Sample 3", speed: 1.03 },
};
const DEFAULT_VOICE = "prashish2";
// The page lists models in this order. v4 has no speed, style or speaker boost setting and ignores SSML pauses.
const MODELS = {
  v4: { id: "eleven_v4", name: "v4" },
  v2: { id: "eleven_multilingual_v2", name: "v2" },
};
const DEFAULT_MODEL = "v4";
const V2_SETTINGS = { stability: 0.6, similarity_boost: 0.75, style: 0.1, use_speaker_boost: true };
const V4_SETTINGS = { stability: 0.6, similarity_boost: 0.75 };
const FORMAT = "mp3_44100_128";
const MAX_CHARS = 9500; // One request takes up to 10,000 characters, and longer posts would need splitting.
// v2 reads a title at the start of a long text slow and drawn out, so there the title is its own request, a little faster than the body.
const TITLE_SPEEDUP = 0.05;
const TITLE_GAP = 0.3; // seconds of silence added between a separately read title and the body
const PARAGRAPH_PAUSE = 0.5;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "site/content");
const DATA = path.join(ROOT, "site/data/audiobook.json");

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? undefined : args.splice(i, 2)[1];
};
const onlyVoice = flag("voice");
const onlyModel = flag("model");
const dry = args.includes("--dry") && !!args.splice(args.indexOf("--dry"), 1);
const post = args[0] && path.resolve(args[0]);
const key = process.env.ELEVENLABS_API_KEY;
if ((!key && !dry) || !post || !post.endsWith(".md") || (onlyVoice && !VOICES[onlyVoice]) || (onlyModel && !MODELS[onlyModel])) {
  console.error(`Usage: ELEVENLABS_API_KEY=... node scripts/narrate-post.mjs <post.md> [--model ${Object.keys(MODELS).join("|")}] [--voice ${Object.keys(VOICES).join("|")}] [--dry]`);
  process.exit(1);
}

// The narration is the title, then each paragraph of the body with images, figures, styles, controls, shortcodes and markdown removed.
const raw = fs.readFileSync(post, "utf8");
const fm = raw.match(/^---\n([\s\S]*?)\n---\n?/);
const field = (name) => fm?.[1].match(new RegExp(`^${name}:\\s*(.+)$`, "m"))?.[1].trim().replace(/^(["'])(.*)\1$/, "$2");
const title = field("title");
if (!title) throw new Error(`No title in the front matter of ${post}`);

const ENTITIES = { "&amp;": "&", "&nbsp;": " ", "&mdash;": ", ", "&ndash;": ", ", "&rsquo;": "’", "&lsquo;": "‘", "&ldquo;": "“", "&rdquo;": "”" };
const inline = (s) => s
  .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
  .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
  .replace(/<[^>]+>/g, "")
  .replace(/&[a-z]+;/g, (e) => ENTITIES[e] ?? e)
  .replace(/`([^`]+)`/g, "$1")
  .replace(/(\*\*|\*)(\S(?:.*?\S)?)\1/g, "$2")
  .replace(/(^|[\s(])_(\S(?:.*?\S)?)_(?=[\s.,;:!?)]|$)/g, "$1$2")
  .replace(/\s+/g, " ")
  .trim();
const same = (a, b) => a.toLowerCase().replace(/\W/g, "") === b.toLowerCase().replace(/\W/g, "");
const paragraphs = raw
  .slice(fm ? fm[0].length : 0)
  .replace(/```[\s\S]*?```/g, "")
  .replace(/\{\{[<%][\s\S]*?[%>]\}\}/g, "")
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<(style|script|figure|svg|button|nav)\b[\s\S]*?<\/\1>/gi, "")
  // The controls of an interactive page, such as a row of previous and next buttons, are not read.
  .replace(/<(\w+)[^>]*\bclass="[^"]*\bnav[^"]*"[^>]*>[\s\S]*?<\/\1>/gi, "")
  // A link on a line of its own is a call to action, such as "Watch the full lecture on YouTube".
  .replace(/^\s*(<a\b[^>]*>[\s\S]*?<\/a>|\[[^\]]*\]\([^)]*\))\s*$/gm, "")
  // Each block of an HTML layout is read as its own paragraph.
  .replace(/<\/(div|p|h[1-6]|li|blockquote|section|header|footer)>|<br\s*\/?>/gi, "\n\n")
  .split(/\n\s*\n/)
  .map((block) => block.split("\n").filter((line) => !/^\s*\|/.test(line)).map((line) => line.replace(/^\s*(>\s?|[-*+]\s+|\d+\.\s+)/, "")).join(" "))
  .map((block) => block.replace(/^#+\s+/, ""))
  .map(inline)
  .filter(Boolean)
  .filter((p, i) => !(i === 0 && same(p, title)))
  // A heading or label without punctuation ends with a full stop, so it is read as a sentence of its own.
  .map((p) => (/[.!?:;"'”’)…]$/.test(p) ? p : `${p}.`));
// A heading that repeats the title at the top of the body is dropped above, so the title is read once.
if (!paragraphs.length) throw new Error(`Nothing to read in ${post}`);
const titleText = /[.!?]$/.test(title) ? title : `${title}.`;
const bodyText = paragraphs.join(` <break time="${PARAGRAPH_PAUSE}s" /> `);
// v4 takes its pauses from the blank lines between the title and paragraphs.
const plainText = [titleText, ...paragraphs].join("\n\n");
for (const t of [bodyText, plainText]) {
  if (t.length > MAX_CHARS) throw new Error(`${post} is ${t.length} characters, over the ${MAX_CHARS} one request can take`);
}
if (dry) {
  console.log(`${plainText}\n\n${plainText.length} characters`);
  process.exit(0);
}

// The requests that make one clip. With two, the title and body are read separately and joined after TITLE_GAP.
function requestsFor(model, { speed }) {
  const model_id = MODELS[model].id;
  if (model !== "v2") return [{ text: plainText, model_id, voice_settings: V4_SETTINGS }];
  // The title hears the first paragraph as what follows, and the body hears the title as what came before, so the two join smoothly.
  return [
    { text: titleText, model_id, voice_settings: { ...V2_SETTINGS, speed: Math.min(1.2, speed + TITLE_SPEEDUP) }, next_text: paragraphs[0] },
    { text: bodyText, model_id, voice_settings: { ...V2_SETTINGS, speed }, previous_text: titleText },
  ];
}

// ElevenLabs mp3s are an ID3 tag, an "Info" frame that describes the whole file, then constant bitrate MPEG-1 Layer III frames.
// Joining the title and body keeps only their audio frames, so a player works out the length from the file size.
const KBPS = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const HZ = [44100, 48000, 32000];
const frameSize = (b, i) => Math.floor((144000 * KBPS[b[i + 2] >> 4]) / HZ[(b[i + 2] >> 2) & 3]) + ((b[i + 2] >> 1) & 1);
function audioFrames(buf) {
  let i = 0;
  if (buf.toString("latin1", 0, 3) === "ID3") i = 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]) + (buf[5] & 0x10 ? 10 : 0);
  const frames = [];
  while (i + 4 <= buf.length && buf[i] === 0xff && (buf[i + 1] & 0xfe) === 0xfa) {
    const size = frameSize(buf, i);
    if (i + size > buf.length) break;
    const side = 4 + ((buf[i + 3] >> 6) === 3 ? 17 : 32);
    const tag = buf.toString("latin1", i + side, i + side + 4);
    if (frames.length || (tag !== "Info" && tag !== "Xing")) frames.push(buf.subarray(i, i + size));
    i += size;
  }
  if (!frames.length || (i < buf.length && buf.toString("latin1", i, i + 3) !== "TAG")) throw new Error(`Unexpected mp3 data at byte ${i}`);
  return frames;
}
// A frame whose side information is all zero carries no audio data, so it plays as silence.
function silence(like, seconds) {
  const frame = Buffer.alloc(frameSize(Buffer.from([0xff, 0xfb, like[2] & ~0x02]), 0));
  frame.set([0xff, 0xfb, like[2] & ~0x02, like[3]]);
  return Array(Math.round((seconds * HZ[(like[2] >> 2) & 3]) / 1152)).fill(frame);
}
const seconds = (frames) => Math.round(((frames.length * 1152) / HZ[(frames[0][2] >> 2) & 3]) * 10) / 10;

const page = path.relative(CONTENT, post).split(path.sep).join("/");
if (page.startsWith("..")) throw new Error(`${post} is outside site/content`);
const audio = `/audio/${page.replace(/\.md$/, "")}/`;

let made = 0;
let skipped = 0;
let credits = 0;
for (const m of onlyModel ? [onlyModel] : Object.keys(MODELS)) {
  const outDir = path.join(ROOT, "site/static", audio, m);
  const manifestPath = path.join(outDir, "manifest.json");
  fs.mkdirSync(outDir, { recursive: true });
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

  for (const v of onlyVoice ? [onlyVoice] : Object.keys(VOICES)) {
    const { id } = VOICES[v];
    const file = `${v}.mp3`;
    const requests = requestsFor(m, VOICES[v]);
    const hash = crypto.createHash("sha256").update(JSON.stringify([id, FORMAT, TITLE_GAP, requests])).digest("hex").slice(0, 16);
    const out = path.join(outDir, file);
    if (manifest[file] === hash && fs.existsSync(out)) {
      skipped++;
      continue;
    }

    const parts = [];
    for (const body of requests) {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}?output_format=${FORMAT}`, {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`${m}/${v}: ${res.status} ${await res.text()}`);
      credits += Number(res.headers.get("character-cost") ?? 0);
      parts.push(audioFrames(Buffer.from(await res.arrayBuffer())));
    }
    fs.writeFileSync(out, Buffer.concat(parts.flatMap((frames, i) => (i ? [...silence(frames[0], TITLE_GAP), ...frames] : frames))));
    manifest[file] = hash;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    console.log(`made ${audio}${m}/${file}`);
    made++;
  }
}

// Record the length of every clip this post has, then list the models and voices that appear in any post, in the order above.
const data = fs.existsSync(DATA) ? JSON.parse(fs.readFileSync(DATA, "utf8")) : { posts: {} };
const lengths = {};
for (const m of Object.keys(MODELS)) {
  for (const v of Object.keys(VOICES)) {
    const file = path.join(ROOT, "site/static", audio, m, `${v}.mp3`);
    if (fs.existsSync(file)) (lengths[m] ??= {})[v] = seconds(audioFrames(fs.readFileSync(file)));
  }
}
data.posts[page] = { audio, seconds: lengths };
const posts = Object.values(data.posts);
const usedModels = new Set(posts.flatMap((p) => Object.keys(p.seconds)));
const usedVoices = new Set(posts.flatMap((p) => Object.values(p.seconds).flatMap((byVoice) => Object.keys(byVoice))));
const models = Object.entries(MODELS).filter(([m]) => usedModels.has(m)).map(([m, { name }]) => ({ key: m, name }));
const voices = Object.entries(VOICES).filter(([v]) => usedVoices.has(v)).map(([v, { name }]) => ({ key: v, name }));
fs.mkdirSync(path.dirname(DATA), { recursive: true });
fs.writeFileSync(DATA, JSON.stringify({
  model: usedModels.has(DEFAULT_MODEL) ? DEFAULT_MODEL : models[0]?.key,
  voice: usedVoices.has(DEFAULT_VOICE) ? DEFAULT_VOICE : voices[0]?.key,
  models,
  voices,
  posts: data.posts,
}, null, 2) + "\n");
console.log(`${made} clip(s) generated, ${skipped} unchanged, ${plainText.length} characters each, ${credits} credits used, for ${page}`);

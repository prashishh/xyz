#!/usr/bin/env node
// Reads posts aloud with ElevenLabs for the /audiobook page and the play buttons in post lists.
//
//   ELEVENLABS_API_KEY=... npm run narrate:post -- site/content/fragments/world-class-network.md
//   npm run narrate:post -- <post.md> --dry     prints the text that would be read, without calling ElevenLabs
//   ELEVENLABS_API_KEY=... npm run narrate:post -- <post.md> --align     fetches only the word timings of a clip that exists already
//   npm run narrate:post -- --missing           lists new posts without audio in the default model and voice
//   ELEVENLABS_API_KEY=... npm run narrate:post -- --missing --yes     narrates them (the "Narrate new posts" workflow runs this)
//
// Each model and voice gets one clip, <section>/<post>/<model>/<voice>.mp3 in the R2 bucket, that reads the title and then the body.
// The site uses Sample 2 on v4. With more entries in VOICES or MODELS, a post is read with every one of them unless --model or
// --voice picks one, and the audiobook page offers a choice; --missing only covers posts dated on or after AUTO_FROM, and reads
// them in DEFAULT_MODEL and DEFAULT_VOICE alone.
// site/data/audiobook.json lists the narrated posts with the length of each clip, and the pages are built from it.
// Re-run it after editing a post. Clips whose text and settings are unchanged are skipped.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

// Voices by ElevenLabs voice ID, in the order the page lists them.
const VOICES = {
  prashish2: { id: "bgNm9pp0UvhCbGbheCIV", name: "Prashish Sample 2" },
};
// Models in the order the page lists them. v4 has no speed, style or speaker boost setting and ignores SSML pauses,
// so it takes its pauses from the blank lines between paragraphs. maxChars keeps each request under the model's limit.
const MODELS = {
  v4: { id: "eleven_v4", name: "v4", maxChars: 9500, settings: { stability: 0.6, similarity_boost: 0.75 } },
};
// The voice and model the site plays first, and the only ones --missing records.
const DEFAULT_VOICE = "prashish2";
const DEFAULT_MODEL = "v4";
// --missing narrates posts dated from this day on, so older posts are only narrated when asked for by name.
const AUTO_FROM = "2026-10-03";
const SECTIONS = ["fragments", "seeking", "essays", "ai"];
const FORMAT = "mp3_44100_192"; // the best mp3 ElevenLabs makes
const CHUNK_GAP = 0.4; // seconds of silence between the requests a long post is split into
const STEP_GAP = 0.8; // seconds of silence between the steps of a walkthrough
// An ElevenLabs pronunciation dictionary that reads "Prashish" as "Praashish", used for posts that say the name.
const PRONUNCIATION = { pronunciation_dictionary_id: "3brYeu1vQCiBl0OQnWWL", version_id: "ZA2tg56axpoCjwZqYXrk" };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "site/content");
const DATA = path.join(ROOT, "site/data/audiobook.json");
// Clips live in the Cloudflare R2 bucket, at <section>/<post>/<model>/<voice>.mp3, and the site plays them from AUDIO_BASE.
// A copy of each clip recorded here is kept in .audio, which git ignores. Uploads use wrangler, logged in to CLOUDFLARE_ACCOUNT
// (or with CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID set, as in the "Narrate new posts" workflow).
const BUCKET = "prashish-audio";
const CLOUDFLARE_ACCOUNT = "0acd9deb4bc5f7603c40e83b09e20ae6";
const AUDIO_BASE = "https://audio.prashish.xyz/"; // the bucket's custom domain
const CACHE = path.join(ROOT, ".audio");

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

// A post's front matter and narration: the title, then each paragraph of the body with images, figures, styles,
// controls, shortcodes and markdown removed. A post whose words live in an interactive script instead can have its
// narration written in scripts/narration/<section>/<post>.md, which is read in place of the body.
export function readPost(file) {
  const raw = fs.readFileSync(file, "utf8");
  const page = path.relative(CONTENT, file).split(path.sep).join("/");
  if (page.startsWith("..")) throw new Error(`${file} is outside site/content`);
  const narration = path.join(ROOT, "scripts/narration", page);
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const field = (name) => fm?.[1].match(new RegExp(`^${name}:\\s*(.+)$`, "m"))?.[1].trim().replace(/^(["'])(.*)\1$/, "$2");
  const title = field("title");
  if (!title) throw new Error(`No title in the front matter of ${file}`);
  const paragraphs = (fs.existsSync(narration) ? fs.readFileSync(narration, "utf8") : raw.slice(fm ? fm[0].length : 0))
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\{\{[<%][\s\S]*?[%>]\}\}/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(style|script|figure|svg|button|nav|table|pre)\b[\s\S]*?<\/\1>/gi, "")
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
    // A separator such as --- has no words to read, and a diagram drawn with box characters is not read.
    .filter((p) => /[\p{L}\p{N}]/u.test(p) && !/[\u2500-\u257F]/.test(p))
    // A lowercase line without punctuation is a label in a diagram, such as "what they see".
    .filter((p) => !/^\p{Ll}/u.test(p) || /[.!?:;"'”’)…]$/.test(p))
    // A heading that repeats the title at the top of the body is dropped, so the title is read once.
    .filter((p, i) => !(i === 0 && same(p, title)))
    // A heading or label without punctuation ends with a full stop, so it is read as a sentence of its own.
    .map((p) => (/[.!?:;"'”’)…]$/.test(p) ? p : `${p}.`));
  // Reading stops at a list of sources, such as a "Further Reading" or "Data Sources" heading.
  const end = paragraphs.findIndex((p) => /^(further reading|references|sources|data sources\b.*|bibliography)[.:]?$/i.test(p));
  if (end > 0) paragraphs.length = end;
  if (!paragraphs.length) throw new Error(`Nothing to read in ${file}`);
  const titleText = /[.!?]$/.test(title) ? title : `${title}.`;
  return {
    file,
    page,
    audio: `${page.replace(/\.md$/, "")}/`,
    date: field("date") ?? "",
    draft: field("draft") === "true",
    // "narrate: false" in the front matter keeps a post out of --missing.
    skip: field("narrate") === "false",
    // A post with a walkthrough is read with the walkthrough's own explanation clips (scripts/narrate-walkthrough.mjs).
    // Other pages embedded with the same shortcode, such as the scenes in /scenes/, have no clips, so the post text is read.
    walkthrough: raw.match(/\{\{<\s*walkthrough\s+src="(\/walkthroughs\/[^"]+)"/)?.[1],
    titleText,
    paragraphs,
    plainText: [titleText, ...paragraphs].join("\n\n"),
  };
}

// Groups texts, in order, into runs whose joined length stays within max, so a long post becomes several requests.
function chunks(texts, sep, max) {
  const out = [[]];
  for (const t of texts) {
    if (t.length > max) throw new Error(`A paragraph is ${t.length} characters, over the ${max} one request can take: ${t.slice(0, 60)}…`);
    const last = out[out.length - 1];
    if (last.length && [...last, t].join(sep).length > max) out.push([t]);
    else last.push(t);
  }
  return out.map((run) => run.join(sep));
}

// The requests that make one clip (a long post is split into several, joined by CHUNK_GAP), and the hash that marks it
// in site/data/audiobook.json, so an unchanged clip is not recorded again.
export function clipRequests(post, model, voice) {
  const { id: model_id, maxChars, settings } = MODELS[model];
  const requests = chunks([post.titleText, ...post.paragraphs], "\n\n", maxChars).map((text) => ({
    text,
    model_id,
    voice_settings: settings,
    ...(/prashish/i.test(text) ? { pronunciation_dictionary_locators: [PRONUNCIATION] } : {}),
  }));
  const hash = crypto.createHash("sha256").update(JSON.stringify([VOICES[voice].id, FORMAT, requests, ...(requests.length > 1 ? [CHUNK_GAP] : [])])).digest("hex").slice(0, 16);
  return { requests, hash };
}

// ElevenLabs mp3s are an ID3 tag, an "Info" frame that describes the whole file, then constant bitrate MPEG-1 Layer III frames.
// Joining clips keeps only their audio frames, so a player works out the length from the file size.
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

// Records the clips of one post that are missing or out of date, then updates site/data/audiobook.json.
export async function narrate(post, models, voices, key) {
  let made = 0, skipped = 0, credits = 0;
  for (const m of models) {
    for (const v of voices) {
      const walk = post.walkthrough && walkthroughClips(post, v);
      const { requests, hash } = walk ?? clipRequests(post, m, v);
      if (readData().posts[post.page]?.hashes?.[m]?.[v] === hash) {
        skipped++;
        continue;
      }

      const parts = walk ? walk.files.map((f) => audioFrames(fs.readFileSync(f))) : [];
      for (const body of walk ? [] : requests) {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICES[v].id}?output_format=${FORMAT}`, {
          method: "POST",
          headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`${post.page} ${m}/${v}: ${res.status} ${await res.text()}`);
        credits += Number(res.headers.get("character-cost") ?? 0);
        parts.push(audioFrames(Buffer.from(await res.arrayBuffer())));
      }
      const frames = parts.flatMap((f, i) => (i ? [...silence(f[0], walk ? STEP_GAP : CHUNK_GAP), ...f] : f));
      const clip = `${post.audio}${m}/${v}.mp3`;
      const local = path.join(CACHE, clip);
      fs.mkdirSync(path.dirname(local), { recursive: true });
      fs.writeFileSync(local, Buffer.concat(frames));
      upload(clip, local);
      saveClip(post, m, v, { hash, seconds: seconds(frames) });
      console.log(`made ${clip}`);
      made++;
      // The word timings drive the read-along view. A failure here only costs that view, so it does not stop the run.
      if (!walk) await alignClip(post, m, v, key).catch((e) => console.error(`No word timings for ${post.page}: ${e.message}`));
    }
  }
  console.log(`${made} clip(s) generated, ${skipped} unchanged, ${post.plainText.length} characters each, ${credits} credits used, for ${post.page}`);
  return credits;
}

// A walkthrough's explanation clips in step order (s1-more.mp3, s2-more.mp3, …), recorded in the same voice, and a hash
// of them, so the joined clip is remade when one of them changes.
function walkthroughClips(post, voice) {
  const dir = path.join(ROOT, "site/static", path.dirname(post.walkthrough), "audio", path.basename(post.walkthrough, ".html"), voice);
  const files = (fs.existsSync(dir) ? fs.readdirSync(dir) : [])
    .filter((f) => /^s\d+-more\.mp3$/.test(f))
    .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
    .map((f) => path.join(dir, f));
  if (!files.length) throw new Error(`No explanation clips for ${post.page} in ${dir}`);
  const hash = crypto.createHash("sha256");
  for (const f of files) hash.update(fs.readFileSync(f));
  return { files, requests: [], hash: `walkthrough-${hash.update(String(STEP_GAP)).digest("hex").slice(0, 16)}` };
}

// The word timings of a clip, for the read-along view: ElevenLabs aligns the narration's text with the audio, and the words
// are saved by paragraph as [word, start, end] in <clip>.words.json next to the clip, which the pages load when needed.
async function alignClip(post, model, voice, key) {
  const clip = `${post.audio}${model}/${voice}.mp3`;
  const local = path.join(CACHE, clip);
  if (!fs.existsSync(local)) throw new Error(`No local copy of ${clip}`);
  const form = new FormData();
  form.append("file", new Blob([fs.readFileSync(local)], { type: "audio/mpeg" }), "clip.mp3");
  form.append("text", post.plainText);
  const res = await fetch("https://api.elevenlabs.io/v1/forced-alignment", { method: "POST", headers: { "xi-api-key": key }, body: form });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const words = (await res.json()).words.filter((w) => w.text.trim());
  // The aligner sometimes keeps a phrase such as "(opus4.5, glm-4.7, auto)" as one word, so paragraphs are split by counting the
  // characters that are not spaces: the title first, then each paragraph. Both sides spell out the same characters.
  const size = (t) => t.replace(/\s/g, "").length;
  const targets = [post.titleText, ...post.paragraphs].map(size);
  if (words.reduce((n, w) => n + size(w.text), 0) !== targets.reduce((a, b) => a + b, 0)) throw new Error("the aligned words do not spell out the text");
  const round = (n) => Math.round(n * 100) / 100;
  // Markdown marks that were not stripped from the text are not words to show.
  const clean = (t) => t.replace(/[_*]/g, "").replace(/\.{2,}/g, ".");
  let at = 0;
  const paragraphs = targets.map((target) => {
    const out = [];
    for (let n = 0; n < target; at++) { n += size(words[at].text); out.push([clean(words[at].text), round(words[at].start), round(words[at].end)]); }
    return out;
  });
  const file = `${local.replace(/\.mp3$/, "")}.words.json`;
  fs.writeFileSync(file, JSON.stringify({ p: paragraphs.slice(1) }));
  upload(`${clip.replace(/\.mp3$/, "")}.words.json`, file, "application/json");
  saveWords(post, model, voice);
  console.log(`words ${clip.replace(/\.mp3$/, "")}.words.json`);
}

// Puts a clip in the R2 bucket, from where the site plays it.
export function upload(clip, local, type = "audio/mpeg") {
  execFileSync(process.env.WRANGLER ?? "wrangler", ["r2", "object", "put", `${BUCKET}/${clip}`, "--file", local, "--content-type", type, "--cache-control", "public, max-age=86400", "--remote"], {
    env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID ?? CLOUDFLARE_ACCOUNT },
    stdio: ["ignore", "ignore", "inherit"],
  });
}

const readData = () => (fs.existsSync(DATA) ? JSON.parse(fs.readFileSync(DATA, "utf8")) : { posts: {} });

// Marks in site/data/audiobook.json that a clip has word timings, so its pages offer the read-along view.
function saveWords(post, model, voice) {
  const data = readData();
  const entry = data.posts[post.page];
  if (!entry) return;
  ((entry.words ??= {})[model] ??= {})[voice] = true;
  fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + "\n");
}

// Records a clip's hash and length for its post in site/data/audiobook.json, then lists the models and voices that appear in
// any post, in the order above. The file is read and written in one go, so posts recorded side by side do not overwrite each other.
export function saveClip(post, model, voice, { hash, seconds: length }) {
  const data = readData();
  const entry = (data.posts[post.page] ??= { audio: post.audio, seconds: {}, hashes: {} });
  entry.audio = post.audio;
  ((entry.seconds ??= {})[model] ??= {})[voice] = length;
  ((entry.hashes ??= {})[model] ??= {})[voice] = hash;
  const posts = Object.values(data.posts);
  const usedModels = new Set(posts.flatMap((p) => Object.keys(p.seconds)));
  const usedVoices = new Set(posts.flatMap((p) => Object.values(p.seconds).flatMap((byVoice) => Object.keys(byVoice))));
  const models = Object.entries(MODELS).filter(([m]) => usedModels.has(m)).map(([m, { name }]) => ({ key: m, name }));
  const voices = Object.entries(VOICES).filter(([v]) => usedVoices.has(v)).map(([v, { name }]) => ({ key: v, name }));
  fs.mkdirSync(path.dirname(DATA), { recursive: true });
  fs.writeFileSync(DATA, JSON.stringify({
    base: AUDIO_BASE,
    model: usedModels.has(DEFAULT_MODEL) ? DEFAULT_MODEL : models[0]?.key,
    voice: usedVoices.has(DEFAULT_VOICE) ? DEFAULT_VOICE : voices[0]?.key,
    models,
    voices,
    posts: data.posts,
  }, null, 2) + "\n");
}

// Published posts dated from AUTO_FROM on (as written in the post) whose default clip does not exist yet.
function missingPosts() {
  const now = new Date();
  return SECTIONS.flatMap((s) => {
    const dir = path.join(CONTENT, s);
    return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".md") && f !== "_index.md").map((f) => readPost(path.join(dir, f))) : [];
  }).filter((p) => {
    if (p.draft || p.skip || p.date.slice(0, 10) < AUTO_FROM || new Date(p.date) > now) return false;
    return !readData().posts[p.page]?.hashes?.[DEFAULT_MODEL]?.[DEFAULT_VOICE];
  });
}

// The command line, when this file is run rather than imported (scripts/voice-agent.mjs imports readPost).
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();

async function main() {
  const args = process.argv.slice(2);
  const flag = (name) => {
    const i = args.indexOf(`--${name}`);
    return i < 0 ? undefined : args.splice(i, 2)[1];
  };
  const option = (name) => args.includes(`--${name}`) && !!args.splice(args.indexOf(`--${name}`), 1);
  const onlyVoice = flag("voice");
  const onlyModel = flag("model");
  const dry = option("dry");
  const missing = option("missing");
  const alignOnly = option("align");
  const yes = option("yes");
  const key = process.env.ELEVENLABS_API_KEY;
  const usage = `Usage: ELEVENLABS_API_KEY=... node scripts/narrate-post.mjs <post.md> [--model ${Object.keys(MODELS).join("|")}] [--voice ${Object.keys(VOICES).join("|")}] [--dry]
         ELEVENLABS_API_KEY=... node scripts/narrate-post.mjs --missing [--yes]`;

  if (missing) {
    const todo = missingPosts();
    for (const p of todo) console.log(`${p.page}: ${p.plainText.length} characters`);
    console.log(`${todo.length} post(s) from ${AUTO_FROM} on without ${DEFAULT_MODEL}/${DEFAULT_VOICE} audio, ${todo.reduce((n, p) => n + p.plainText.length, 0)} characters in all`);
    if (!yes || !todo.length) process.exit(0);
    if (!key) {
      console.error(usage);
      process.exit(1);
    }
    // One post failing, say on an ElevenLabs or R2 error, does not stop the others; the run still fails at the end, so it shows.
    let credits = 0;
    const failed = [];
    for (const p of todo) {
      try {
        credits += await narrate(p, [DEFAULT_MODEL], [DEFAULT_VOICE], key);
      } catch (e) {
        failed.push(p.page);
        console.error(`FAILED ${p.page}: ${e.message}`);
      }
    }
    console.log(`${credits} credits used in all${failed.length ? `, ${failed.length} failed: ${failed.join(", ")}` : ""}`);
    if (failed.length) process.exitCode = 1;
  } else {
    const file = args[0] && path.resolve(args[0]);
    if ((!key && !dry) || !file || !file.endsWith(".md") || (onlyVoice && !VOICES[onlyVoice]) || (onlyModel && !MODELS[onlyModel])) {
      console.error(usage);
      process.exit(1);
    }
    const post = readPost(file);
    if (dry) {
      console.log(`${post.plainText}\n\n${post.plainText.length} characters`);
    } else {
      const models = onlyModel ? [onlyModel] : Object.keys(MODELS), voices = onlyVoice ? [onlyVoice] : Object.keys(VOICES);
      if (alignOnly) {
        // Only the word timings, for clips that already exist.
        for (const m of models) for (const v of voices) if (readData().posts[post.page]?.seconds?.[m]?.[v]) await alignClip(post, m, v, key);
      } else {
        await narrate(post, models, voices, key);
      }
    }
  }
}

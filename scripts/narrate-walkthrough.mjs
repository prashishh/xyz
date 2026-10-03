#!/usr/bin/env node
// Generates the narration audio for a walkthrough page with ElevenLabs.
//
//   ELEVENLABS_API_KEY=... npm run narrate -- site/static/walkthroughs/your-body-sits-inside-you.html
//   ELEVENLABS_API_KEY=... npm run narrate -- <page> --voice <name> --steps 1
//
// Each voice gets its own folder in site/static/walkthroughs/audio/<page>/<voice>/ with these clips per step:
//   s<n>-en.mp3    the English verse (played by "Listen to the verse")
//   s<n>-sa.mp3    the Sanskrit verse (played by "Listen to the verse")
//   s<n>-more.mp3  the explanation (played by "Listen")
// voices.json in the page folder lists the generated voices, and the page shows a voice picker when it lists more than one.
// Re-run it after editing the step text. Clips whose text and voice settings are unchanged are skipped.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import vm from "node:vm";

// To add a voice, add an entry with its ElevenLabs voice ID. The page shows a voice picker once two voices have clips.
const VOICES = {
  prashish2: { id: "bgNm9pp0UvhCbGbheCIV", name: "Prashish" }, // "Prashish Sample 2" clone
};
// Every clip uses Eleven v4 at 192 kbps like the other posts. v4 has no speed or style setting and takes its pauses from
// line breaks (blank lines between paragraphs, single ones between the lines of a verse).
const MODEL_ID = "eleven_v4";
const SETTINGS = { stability: 0.6, similarity_boost: 0.75 };
const FORMAT = "mp3_44100_192";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? undefined : args.splice(i, 2)[1];
};
const voiceKey = flag("voice") ?? "prashish2";
const stepLimit = Number(flag("steps") ?? Infinity);
const page = args[0];
const key = process.env.ELEVENLABS_API_KEY;
const voice = VOICES[voiceKey];
if (!key || !page || !voice) {
  console.error(`Usage: ELEVENLABS_API_KEY=... node scripts/narrate-walkthrough.mjs <walkthrough.html> [--voice ${Object.keys(VOICES).join("|")}] [--steps n]`);
  process.exit(1);
}

// The steps live in the page as `var CH=[ ... ];`, so evaluate that block on its own.
const html = fs.readFileSync(page, "utf8");
const start = html.indexOf("var CH=[");
const end = html.indexOf("\n];", start);
if (start < 0 || end < 0) throw new Error(`No "var CH=[ ... ];" block in ${page}`);
const CH = vm.runInNewContext(html.slice(start, end + 3) + "\nCH", {}).slice(0, stepLimit);

const plain = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
// Steps without a verse get only the explanation clip.
const clips = CH.flatMap((c, i) => [
  c.en && { file: `s${i + 1}-en.mp3`, kind: "en", text: plain(c.en) },
  // The double danda that closes a verse makes the voice add stray sounds after it, so it is read as a single danda.
  c.sa && { file: `s${i + 1}-sa.mp3`, kind: "sa", text: c.sa.split(/<br\s*\/?>/i).map(plain).join("\n").replace(/॥/g, "।") },
  { file: `s${i + 1}-more.mp3`, kind: "more", text: c.copy.map(plain).join("\n\n") },
].filter(Boolean));

const pageDir = path.join(path.dirname(page), "audio", path.basename(page, ".html"));
const outDir = path.join(pageDir, voiceKey);
const manifestPath = path.join(outDir, "manifest.json");
fs.mkdirSync(outDir, { recursive: true });
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

let made = 0;
for (const clip of clips) {
  const body = { text: clip.text, model_id: MODEL_ID, voice_settings: SETTINGS };
  const hash = crypto.createHash("sha256").update(JSON.stringify([voice.id, FORMAT, body])).digest("hex").slice(0, 16);
  const out = path.join(outDir, clip.file);
  if (manifest[clip.file] === hash && fs.existsSync(out)) continue;

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.id}?output_format=${FORMAT}`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${clip.file}: ${res.status} ${await res.text()}`);
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  manifest[clip.file] = hash;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`made ${voiceKey}/${clip.file}`);
  made++;
}

// List every voice folder that has clips, in the order of VOICES, with how many steps it covers.
const listed = {};
for (const [k, v] of Object.entries(VOICES)) {
  const dir = path.join(pageDir, k);
  if (!fs.existsSync(dir)) continue;
  let steps = 0;
  while (fs.existsSync(path.join(dir, `s${steps + 1}-more.mp3`))) steps++;
  if (steps) listed[k] = { name: v.name, steps };
}
fs.writeFileSync(path.join(pageDir, "voices.json"), JSON.stringify(listed, null, 2) + "\n");
console.log(`${made} clip(s) generated, ${clips.length - made} unchanged, in ${outDir}`);

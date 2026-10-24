#!/usr/bin/env node
// Teaches an ElevenLabs pronunciation dictionary the words in scripts/pronunciations.json (a word and how to spell it so it is said
// right), creating the dictionary the first time, then saves its id and version in that file, which scripts/narrate-post.mjs uses for
// any post that has one of the words. The page keeps the real spelling; only the voice reads the respelling.
//
//   node scripts/pronunciations.mjs --dry                        lists the rules without sending them
//   ELEVENLABS_API_KEY=... node scripts/pronunciations.mjs       sends the rules and saves the version it returns
//
// Run it again after changing a respelling. The clip of a post with one of the words is then recorded again by the next narration,
// because the dictionary version is part of what marks a clip as unchanged.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "pronunciations.json");
const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
const rules = data.rules.map((r) => ({ string_to_replace: r.word, type: "alias", alias: r.alias }));

if (process.argv.includes("--dry")) {
  for (const r of rules) console.log(`${r.string_to_replace}  ->  ${r.alias}`);
  process.exit(0);
}
const key = process.env.ELEVENLABS_API_KEY;
if (!key) { console.error("Set ELEVENLABS_API_KEY, or use --dry to list the rules."); process.exit(1); }
const headers = { "xi-api-key": key, "content-type": "application/json" };
const res = data.dictionary_id
  ? await fetch(`https://api.elevenlabs.io/v1/pronunciation-dictionaries/${data.dictionary_id}/add-rules`, { method: "POST", headers, body: JSON.stringify({ rules }) })
  : await fetch("https://api.elevenlabs.io/v1/pronunciation-dictionaries/add-from-rules", { method: "POST", headers, body: JSON.stringify({ name: "prashish.xyz names", rules }) });
if (!res.ok) { console.error(`ElevenLabs answered ${res.status}: ${await res.text()}`); process.exit(1); }
const out = await res.json();
data.dictionary_id = out.id;
data.version_id = out.version_id;
fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");
console.log(`Sent ${rules.length} rules. The dictionary ${out.id} is now at version ${out.version_id}.`);

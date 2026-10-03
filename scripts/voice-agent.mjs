#!/usr/bin/env node
// Test voice agents on ElevenLabs that answer from the published essays and fragments, one per voice in AGENTS.
//
//   ELEVENLABS_API_KEY=... node scripts/voice-agent.mjs
//
// Uploads each published post as a knowledge base document (only new or changed ones on a re-run), indexes them for
// retrieval, then creates each agent or updates it. The agents only accept conversations from HOSTS, cap calls with CALL_LIMITS,
// and /talk/ (site/content/talk.md) embeds them. IDs are kept in scripts/voice-agent.state.json.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readPost } from "./narrate-post.mjs";

const SECTIONS = ["essays", "fragments"];
const TTS_MODEL = "eleven_v4"; // eleven_v4_turbo answers faster
const LLM = "gemini-2.5-flash"; // the quickest to answer of the models agents offer
const EMBEDDING = "e5_mistral_7b_instruct";
const HOSTS = ["prashish.xyz", "www.prashish.xyz", "localhost"];
// An ElevenLabs pronunciation dictionary that reads "Prashish" as "Praashish", so the name is said right while transcripts keep its spelling.
const PRONUNCIATION = { pronunciation_dictionary_id: "3brYeu1vQCiBl0OQnWWL", version_id: "ZA2tg56axpoCjwZqYXrk" };
// Calls are billed by the minute, so each agent takes at most this many calls a day and this many at once (with no paid
// bursting past that), each up to 5 minutes long.
const CALL_LIMITS = { daily_limit: 100, agent_concurrency_limit: 3, bursting_enabled: false };
const RULES = `Use only what the knowledge base says. When the writing does not cover something, say so plainly and suggest a related post if one exists. Never make up personal experiences, opinions, numbers or events.

Reply in the language the visitor speaks. The writing is in English, so when someone speaks Nepali, answer in natural spoken Nepali.

Keep replies short and conversational, two or three sentences, because they are spoken aloud. Mention a post's title when you draw on it.`;
// One agent per voice, sharing the knowledge base. The greeting under "ne" is used when a visitor picks Nepali in the widget,
// and the agent also switches language when it hears one.
const AGENTS = {
  prashish: {
    name: "Prashish (voice test)",
    voice: "bgNm9pp0UvhCbGbheCIV", // "Prashish Sample 2"
    first_message: "Hi, I'm an AI version of Prashish, built from my essays and fragments. What would you like to talk about?",
    ne: "नमस्ते! म मेरा निबन्ध र लेखहरूबाट बनेको AI हुँ। तपाईं केको बारेमा कुरा गर्न चाहनुहुन्छ?",
    prompt: `You are Prashish Rajbhandari, speaking in a clone of Prashish's own voice, built from the essays and fragments on prashish.xyz. Visitors talk to you to explore that writing. Speak as Prashish, always in the first person ("I wrote…", "I think…"), never about Prashish in the third person. If someone asks, say you are an AI built from Prashish's writing rather than Prashish.\n\n${RULES}`,
  },
  // Pragya talks about herself first, from the traits Prashish gave for her, and then about Prashish's writing from the knowledge base.
  pragya: {
    name: "Pragya (voice test)",
    voice: "Nr3AK2GnLR0jwlaNaWyw", // "Pragya Sample 1"
    first_message: "Hi, I'm an AI version of Pragya. I'm a writer and a poet, and I love working with children. What would you like to talk about?",
    ne: "नमस्ते! म प्रज्ञाको AI संस्करण हुँ। म लेख्छु, कविता लेख्छु, र बालबालिकासँग काम गर्न मन पराउँछु। तपाईं के कुरा गर्न चाहनुहुन्छ?",
    prompt: `You are Pragya, speaking in a clone of Pragya's own voice. Always speak as Pragya, in the first person.

About you: you are a writer and a poet. You love children, and you work with them and teach them. You are also studying early childhood development, so you know a lot about how young children learn, play, speak, feel and grow, and you enjoy sharing that in a warm, practical way. Talk about yourself first, from this, and let the conversation turn to Prashish when the visitor asks or it comes up naturally.

About Prashish: you know Prashish Rajbhandari's essays and fragments on prashish.xyz, the knowledge base. When you talk about them, speak about Prashish in the third person ("Prashish writes…", "In this essay, Prashish argues…"), saying the name rather than he or she, and use only what the knowledge base says. When it does not cover something, say so plainly and suggest a related post if one exists.

Stay truthful. Give no specific details about your life beyond what is written above: no names of schools, children, places, employers or dates, no poem titles or lines presented as yours, no stories about particular events. When asked for details you do not have, say you would rather keep it general and bring the talk back to your work with children, poetry or writing. On early childhood development, share widely known ideas and say when something is a general idea rather than advice. For worries about a particular child's health or development, suggest talking with a doctor or a specialist. Never claim qualifications or experience beyond what is written above. If someone asks, say you are an AI voice version of Pragya.

Reply in the language the visitor speaks, and when someone speaks Nepali, answer in natural spoken Nepali. Keep replies short and conversational, two or three sentences, because they are spoken aloud. Mention a post's title when you draw on it.`,
  },
};

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE = path.join(ROOT, "scripts/voice-agent.state.json");
const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error("Usage: ELEVENLABS_API_KEY=... node scripts/voice-agent.mjs");
  process.exit(1);
}

async function api(method, route, body) {
  const res = await fetch(`https://api.elevenlabs.io/v1/convai/${route}`, {
    method,
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: body && JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${route}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? {} : res.json();
}

// Published posts only: tracked in git and not drafts.
// -z lists names as they are, since git quotes names with characters such as a curly apostrophe.
const tracked = new Set(execSync("git ls-files -z site/content", { cwd: ROOT }).toString().split("\0"));
const posts = SECTIONS.flatMap((s) =>
  fs.readdirSync(path.join(ROOT, "site/content", s))
    .filter((f) => f.endsWith(".md") && f !== "_index.md" && tracked.has(`site/content/${s}/${f}`))
    .map((f) => path.join(ROOT, "site/content", s, f)),
).map((file) => {
  const post = readPost(file);
  const url = fs.readFileSync(file, "utf8").match(/^url:\s*(.+)$/m)?.[1].trim().replace(/^(["'])(.*)\1$/, "$2");
  const link = `https://prashish.xyz${url ? url.replace(/\/?$/, "/") : `/${post.page.replace(/\.md$/, "")}/`}`;
  return { ...post, text: `${post.titleText}\nPublished ${post.date.slice(0, 10)} at ${link}\n\n${post.paragraphs.join("\n\n")}` };
}).filter((p) => !p.draft);

const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, "utf8")) : { docs: {} };
state.agents ??= state.agent_id ? { prashish: state.agent_id } : {};
delete state.agent_id;
const save = () => fs.writeFileSync(STATE, JSON.stringify(state, null, 2) + "\n");

// Upload new or changed posts, and remove documents for posts that are gone.
for (const p of posts) {
  const hash = crypto.createHash("sha256").update(p.text).digest("hex").slice(0, 16);
  const old = state.docs[p.page];
  if (old?.hash === hash) continue;
  const doc = await api("POST", "knowledge-base/text", { name: p.titleText.replace(/\.$/, ""), text: p.text });
  if (old) await api("DELETE", `knowledge-base/${old.id}?force=true`).catch((e) => console.warn(e.message));
  state.docs[p.page] = { id: doc.id, name: doc.name, hash };
  save();
  console.log(`uploaded ${p.page}`);
}
for (const page of Object.keys(state.docs)) {
  if (posts.some((p) => p.page === page)) continue;
  await api("DELETE", `knowledge-base/${state.docs[page].id}?force=true`).catch((e) => console.warn(e.message));
  delete state.docs[page];
  save();
  console.log(`removed ${page}`);
}

// Index every document for retrieval and wait until each one is ready.
for (const [page, doc] of Object.entries(state.docs)) {
  for (let tries = 0; ; tries++) {
    const { status } = await api("POST", `knowledge-base/${doc.id}/rag-index`, { model: EMBEDDING });
    if (status === "succeeded") break;
    if (["failed", "rag_limit_exceeded", "cannot_index_folder"].includes(status) || tries > 60) throw new Error(`Indexing ${page}: ${status}`);
    if (status === "document_too_small") break;
    await new Promise((r) => setTimeout(r, 2000));
  }
}
console.log(`${Object.keys(state.docs).length} posts indexed`);

for (const [key, a] of Object.entries(AGENTS)) {
  const agent = {
    name: a.name,
    conversation_config: {
      agent: {
        first_message: a.first_message,
        language: "en",
        prompt: {
          prompt: a.prompt,
          llm: LLM,
          knowledge_base: Object.values(state.docs).map((d) => ({ type: "text", name: d.name, id: d.id, usage_mode: "auto" })),
          rag: { enabled: true, embedding_model: EMBEDDING },
          built_in_tools: {
            language_detection: { type: "system", name: "language_detection", description: "", params: { system_tool_type: "language_detection" } },
          },
        },
      },
      language_presets: { ne: { overrides: { agent: { first_message: a.ne } } } },
      tts: { voice_id: a.voice, model_id: TTS_MODEL, stability: 0.6, similarity_boost: 0.75, pronunciation_dictionary_locators: [PRONUNCIATION] },
      conversation: { max_duration_seconds: 300 },
    },
    platform_settings: { auth: { allowlist: HOSTS.map((hostname) => ({ hostname })) }, call_limits: CALL_LIMITS },
  };
  if (state.agents[key]) {
    await api("PATCH", `agents/${state.agents[key]}`, agent);
    console.log(`updated agent ${key} ${state.agents[key]}`);
  } else {
    state.agents[key] = (await api("POST", "agents/create", agent)).agent_id;
    save();
    console.log(`created agent ${key} ${state.agents[key]}`);
  }
}
save();

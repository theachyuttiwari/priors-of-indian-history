/**
 * Priors ingestion pipeline.
 *
 * 1. Research: Claude + web search/fetch finds protests in India in the last N days and how
 *    governments responded, with URLs.
 * 2. Structure: a second call turns the dossier into schema-conforming entries.
 * 3. Write: each entry lands in content/current/<id>.yaml, marked reviewed: false.
 *
 * Run: npx tsx pipeline/ingest.ts [--days 14] [--dry]
 * Auth: ANTHROPIC_API_KEY, or `ant auth login`.
 */
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { ACTION_TYPES, Precedent } from "../src/lib/schema";

const MODEL = "claude-opus-5-5";
const args = process.argv.slice(2);
const DAYS = Number(args[args.indexOf("--days") + 1] || 14);
const DRY = args.includes("--dry");
const ROOT = path.join(process.cwd(), "content");
const TODAY = new Date().toISOString().slice(0, 10);

const client = new Anthropic();

function loadIndex(): string {
  const dir = path.join(ROOT, "precedents");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => {
      const p = Precedent.parse(YAML.parse(fs.readFileSync(path.join(dir, f), "utf8")));
      const types = [...new Set(p.actions.map((a) => a.type))].join(", ");
      return `- ${p.id} (${p.period.start.slice(0, 4)}; ${p.government.state?.party ?? p.government.centre.party}): ${p.title}. Actions: ${types}. Tags: ${p.tags.join(", ")}`;
    })
    .join("\n");
}

function existingCurrent(): Set<string> {
  const dir = path.join(ROOT, "current");
  if (!fs.existsSync(dir)) return new Set();
  return new Set(
    fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".yaml"))
      .map((f) => f.replace(/\.yaml$/, "")),
  );
}

const SCHEMA_DOC = fs.readFileSync(path.join(ROOT, "SCHEMA.md"), "utf8");

async function research(): Promise<string> {
  const prompt = `Today is ${TODAY}. Find protests in India (any state, or national) from the last ${DAYS} days where a government, police force or court took a recordable action: permission granted or denied, Section 144 CrPC / Section 163 BNSS orders, curfews, internet shutdowns, detentions, preventive arrests, FIRs, sedition or UAPA or NSA charges, lathi charge, tear gas, firing, barricading, negotiations, concessions, repeal, commissions of inquiry.

For each protest (up to 4, most significant first), write a dossier:
- title, dates, states and places, cause, organisers, scale
- who governs at the Centre (party, alliance, PM) and in the state (party, CM)
- each action with date, actor (centre/state/police/court), one-line description, and the URL of a source you opened
- statements by parties or leaders: who, their role, whether their party was in power there, date, a short quote, source URL
- outcome so far
- 2 to 4 ids from this list of precedents that are the closest analogues, with one line on why:
${loadIndex()}

Rules: open every URL you cite with web_fetch before citing it. Prefer court orders, PIB, official notifications, then The Hindu, Indian Express, Scroll, The Wire, BBC, NDTV, LiveLaw. Neutral voice. Describe actions, do not judge them. If you find fewer than 4 protests with sourced government actions, report fewer.`;

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    output_config: { effort: "high" },
    tools: [
      {
        type: "web_search_20260209",
        name: "web_search",
        max_uses: 25,
        user_location: { type: "approximate", country: "IN" },
      },
      { type: "web_fetch_20260209", name: "web_fetch", max_uses: 25 },
    ],
    messages: [{ role: "user", content: prompt }],
  });
  const msg = await stream.finalMessage();
  if (msg.stop_reason === "refusal") throw new Error(`Refused: ${msg.stop_details?.explanation ?? ""}`);
  return msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

const Entry = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  period: z.object({ start: z.string(), end: z.string().nullable() }),
  location: z.object({ states: z.array(z.string()), places: z.array(z.string()) }),
  protest: z.object({ cause: z.string(), organisers: z.array(z.string()), scale: z.string() }),
  government: z.object({
    centre: z.object({ party: z.string(), alliance: z.string(), head: z.string(), role: z.string() }),
    state: z.object({ party: z.string(), head: z.string(), role: z.string(), name: z.string() }).nullable(),
  }),
  actions: z.array(
    z.object({
      type: z.enum(ACTION_TYPES),
      date: z.string(),
      description: z.string(),
      actor: z.enum(["centre", "state", "police", "court", "other"]),
      sources: z.array(z.string()),
    }),
  ),
  outcome: z.string(),
  positions: z.array(
    z.object({
      party: z.string(),
      person: z.string(),
      role_at_time: z.string(),
      in_power: z.boolean(),
      date: z.string(),
      statement: z.string(),
      sources: z.array(z.string()),
    }),
  ),
  sources: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      publisher: z.string(),
      url: z.string(),
      date: z.string(),
      type: z.enum(["news", "court_judgment", "official", "academic", "book", "archive"]),
    }),
  ),
  tags: z.array(z.string()),
  related_precedents: z.array(z.string()),
});
const Batch = z.object({ entries: z.array(Entry) });

async function structure(dossier: string) {
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 32000,
    output_config: { effort: "medium", format: zodOutputFormat(Batch) },
    system: `You convert research dossiers into entries that follow this schema exactly. Dates are ISO (YYYY-MM-DD, or YYYY-MM if the day is unknown). Source ids are s1, s2, ... and every action and position must reference at least one. Use only URLs present in the dossier. Party names from the schema list. Neutral voice.\n\n${SCHEMA_DOC}`,
    messages: [{ role: "user", content: dossier }],
  });
  if (res.stop_reason === "refusal") throw new Error(`Refused: ${res.stop_details?.explanation ?? ""}`);
  if (!res.parsed_output) throw new Error("Structured output failed to parse");
  return res.parsed_output.entries;
}

async function main() {
  console.log(`Researching the last ${DAYS} days…`);
  const dossier = await research();
  console.log(`Dossier: ${dossier.length} chars`);
  const entries = await structure(dossier);
  const have = existingCurrent();
  fs.mkdirSync(path.join(ROOT, "current"), { recursive: true });
  for (const e of entries) {
    const check = Precedent.safeParse({
      ...e,
      government: { ...e.government, state: e.government.state ?? undefined },
    });
    if (!check.success) {
      console.warn(`skip ${e.id}: ${check.error.issues.map((i) => i.path.join(".") + " " + i.message).join("; ")}`);
      continue;
    }
    const file = path.join(ROOT, "current", `${e.id}.yaml`);
    const out = {
      ...e,
      government: { ...e.government, state: e.government.state ?? undefined },
      generated_by: `priors-pipeline/${MODEL}`,
      reviewed: false,
      last_updated: TODAY,
    };
    const text =
      `# Drafted by the Priors pipeline on ${TODAY}. Check every source before setting reviewed: true.\n` +
      YAML.stringify(out, { lineWidth: 100 });
    if (DRY) {
      console.log(`--- ${file}\n${text}`);
    } else {
      if (have.has(e.id)) console.log(`update ${e.id}`);
      else console.log(`new    ${e.id}`);
      fs.writeFileSync(file, text);
    }
  }
}

main().catch((err) => {
  if (err instanceof Anthropic.RateLimitError) console.error("Rate limited; retry later.");
  else if (err instanceof Anthropic.AuthenticationError)
    console.error("No credentials. Set ANTHROPIC_API_KEY or run `ant auth login`.");
  else if (err instanceof Anthropic.APIError) console.error(`API error ${err.status}: ${err.message}`);
  else console.error(err);
  process.exit(1);
});

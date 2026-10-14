# Handoff — Priors

Date: 2026-10-15. Written at the end of the first build session. Read this before `docs/`.

## What Priors is

An open-source, India-only reference site. It takes a current protest and how the government
is handling it (permission, Section 144/163, internet shutdown, detention, FIR, talks) and sets it
beside precedents from 1974 onward, across every party at Centre and state. It also shows what
each party did in power next to what it said in opposition. Every claim links to a dated source.

Decisions already made by the owner (do not re-open):
- Name: **Priors**. Tagline: "What they did before."
- Scope for v1: protest handling only.
- Data entry: fully automated LLM ingestion, with human review before an entry loses its
  "not yet reviewed" mark.
- Stack: Next.js 16 static export, Tailwind 4, content as YAML in the repo. Host on GitHub Pages or Vercel.
- Subagents: use Opus 5.5 (`model: "opus"`), not Fable. Owner said Fable is overkill for side tasks.

## State of the repo

```
content/precedents/   26 files, all pass validator     content/current/   2 files, reviewed: false
src/                  site, builds clean (76 pages)    pipeline/          ingest.ts, validate.ts
.github/workflows/    build.yml (Pages), ingest.yml (daily PR)
docs/landscape.md     competitor research              docs/naming.md     domain candidates
```

Commands:
```
npm install
npm run validate          # schema + source-reference checks
npm run build             # static export to out/ (uses --webpack; Turbopack config was removed)
npx serve out -l 4321     # preview
npm run ingest -- --dry   # needs ANTHROPIC_API_KEY or `ant auth login`
```

## What is NOT done

### 1. Thin content (highest priority)
The session's web-search budget ran out midway. Later agents worked from Wikipedia reference
lists and direct fetches, and left out facts they could not open. Re-source these with a fresh budget:

| File | Problem |
|---|---|
| `anti-mandal-agitation-1990.yaml` | 4 actions, mostly Wikipedia-sourced. No Section 144, no party statements. |
| `narmada-bachao-andolan-1989-1993.yaml` | 3 actions. Ferkuwa standoff Jan 1991 and Harsud rally not sourced. |
| `thoothukudi-sterlite-firing-2018.yaml` | No Section 144 entry. Inquiry judge (Aruna Jagadeesan) unnamed. Only 2 positions. |
| `kashmir-unrest-2016.yaml` | NC/Omar Abdullah statements rest on Wikipedia (source s9). |
| `current/election-commission-sir-protests-2026.yaml` | Sources are Al Jazeera, France 24, Wikipedia only. No Section 163 order sourced. Unreviewed. |
| `current/cjp-exam-leak-protests-2026.yaml` | Section 163, permission-denied and FIR facts come from Wikipedia only. Unreviewed. |

Also wanted across many files: PIB / Lok Sabha primary texts, and statements from the ruling
party at the time (agents found opposition quotes more easily than government ones).

Sites that blocked fetch during this session: The Hindu, Indian Express, HT, BBC, NDTV, Reuters,
Times of India, Deccan Herald, Business Standard. Agents used `curl` successfully on some of them.

### 2. Pipeline never ran end to end
`pipeline/ingest.ts` typechecks but has not been executed against the API (no key in this session).
First run: `npm run ingest -- --days 14 --dry`. Expect to tune the two prompts and the Zod `Entry`
shape. Model is `claude-opus-5-5`; research call uses `web_search_20260209` + `web_fetch_20260209`.

### 3. Repo plumbing
- GitHub remote not created. Header and footer link to `https://github.com/` placeholder — fix in
  `src/app/layout.tsx` and `src/app/precedents/[id]/page.tsx`.
- Add repo secret `ANTHROPIC_API_KEY` for `ingest.yml`. Enable Pages (source: GitHub Actions).
- Domain not chosen. See `docs/naming.md`. `priors.in` is taken (registered 2026-08-27 by unknown).
  Available: kathnikarni, pehlebhi, nazeernama, abaurtab on .in/.org/.com; thepriors.in, priorsindia.in.

### 4. UI polish backlog
- Compare heatmap: parties that only appear as "centre" with no centre-actor actions show a
  case count but all dots (e.g. Janata Dal). Consider counting only parties with >= 1 action.
- Party list shows 16 "parties" because `other (...)` free-text values each count as a party.
  Normalise or bucket them in `allParties()` in `src/lib/content.ts`.
- No light theme. CSS vars are in `src/app/globals.css`; the heatmap palette is a 7-step blue ramp.
- Hover tooltips on heatmap are native `title` only.
- No search across precedents beyond the client-side filter on `/precedents`.
- OG image, favicon (use `assets/icon.svg`), sitemap: not done.

### 5. Ideas not started
- Lok Dhaba (TCPD, CC BY 4.0) as the "who ruled where on date X" join table — see landscape.md.
- Ingest SFLC.in / Access Now STOP shutdown datasets as a separate action source (confirm licence).
- Section 144/163 orders archive (district NIC PDFs). No dataset exists anywhere; this is the big gap.

## Conventions the next session must keep
- Schema is `content/SCHEMA.md`, enforced by `src/lib/schema.ts` (Zod). Action types are a closed list.
- Neutral voice. Describe actions, never judge. Contested facts: say so and cite both sides.
- No source, no claim. Validator fails on unknown source ids; it warns on actions with no source.
- Centre actions count for the Centre party; state/police actions for the state party; courts for nobody.
- Pipeline-written entries carry `generated_by`, `reviewed: false`, `last_updated`.
- Commit messages end with `Co-Authored-By: Claude <model> <noreply@anthropic.com>`.

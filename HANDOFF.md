# Handoff — Priors

Updated: 2026-10-15, at the soft launch on GitHub Pages. Read this before `docs/`.

## What Priors is

An open-source, India-only reference site. It takes a current protest and how the state is handling
it (permission, Section 144/163, internet shutdown, detention, FIR, talks) and sets it beside earlier
cases, across every party at the Centre and in the states. Every claim links to a dated source.

Decisions made by the owner (do not re-open):

- Name: **Priors**. Headline (owner, 2026-10-15): "How India’s governments have handled protests".
  It replaced "What they did before", which read as vague and as a gotcha.
- Phase 1: protest handling only, made rock solid (citations, quotes, mobile-first UI). Phase 2 (other
  topics, pre-1947) waits for public response and the owner's word.
- Static site, refreshed by hand. Most readers are on phones: design and check at 390 px first.
- Rules for evidence, quotes, review and corrections: decisions A–I in `docs/proposal-phase1-rules.html`,
  all approved as recommended. Research behind them: `docs/integrity-research.md`.
- Launch on `theachyuttiwari.github.io/priors-of-indian-history` first; a domain comes later.
- Subagents: Opus 5.5 (`model: "opus"`).

## State

```
content/precedents/   26 files     content/current/   2 files     all review: draft
content/checks/       quotes.json  (quote-match results; the validator reads it)
src/                  Next.js 16 static export          tests/   Vitest, 80 tests
pipeline/             validate, archive (Wayback), match-quotes, ingest (never run end to end)
```

Commands:

```
npm run check                      # format, lint, typecheck, tests, validate
npm run validate -- --todos FILE   # sourcing todos for one file
npm run archive [-- --save] [FILE] # Wayback lookups; --save needs IA_ACCESS_KEY and IA_SECRET_KEY
npm run match-quotes [FILE]        # check quotes against archived sources (PDFs need pdftotext)
npm run build                      # static export to out/
PRIORS_SHOW_ALL=1 npm run build    # reviewer build: shows held-back claims with their marks
```

## How the site protects the record

- **Held back (decision C).** A claim below its evidence minimum is not published or counted
  (`holdBack()` in `src/lib/evidence.ts`, applied in `src/lib/content.ts`). Each entry says how many
  claims it holds back. An entry with no publishable action is not published.
- **Party counts paused.** `PARTY_COUNTS = false` in `src/lib/site.ts`. See "Attribution" below.
- Quotes are matched word for word against archived sources; results are in `content/checks/quotes.json`.

## Content pass (step 6)

Done: all 28 files re-sourced against the evidence ladder, with every URL opened. Every entry
publishes. `lead-only`, `tier-missing`, `kind-missing` and `figures-missing` are now errors.
Still todo: 168 below-minimum claims (held back), 224 archive-missing, 14 quote-unchecked.

After each file: `npm run archive FILE`, `npm run match-quotes FILE`, check notable claims by hand,
`npm run validate -- --strict`, commit.

Known gaps across files:

- About 200 sources have no Wayback snapshot. Save Page Now needs the owner's archive.org keys.
- Quotes on sites that refuse the checker (pib.gov.in, pmindia.gov.in, some news sites) were checked
  by hand; the commit messages say which.
- Many party statements have one bylined report only and are held back.
- Commission reports not found online: Aruna Jagadeesan (Thoothukudi). Findings rest on reports.

## Attribution (next build, before party counts return)

Each entry records one Centre government and one state government, and `actionParties()` counts every
state or police action for that one state party. Protests that cross states, or outlast a government,
are counted for the wrong party (anti-CAA: Uttar Pradesh and Karnataka actions counted for AAP).

Fix, approved in principle by the owner:

1. A table of who governed each state, by date, including President's Rule and Delhi Police under the
   Centre. Lok Dhaba (TCPD, CC BY 4.0) is a starting point; check against official lists.
2. A `place` on every action.
3. `actionParties()` looks up the table by place and date. Tests for multi-state and mid-protest change.
4. Set `PARTY_COUNTS = true`.

Files whose agents reported mismatches: narmada, election-commission-sir, gujjar, telangana, enron,
ladakh, kalinganagar, anti-reservation, singur-nandigram, wrestlers, punjab-farmers, agnipath,
farm-laws, anti-caa, kashmir-lockdown, manipur, thoothukudi, india-against-corruption.

## Open decisions for the owner

1. Start date: 15 Aug 1947 recommended (policy text still says 26 Jan 1950).
2. archive.org keys for `npm run archive -- --save` (set them in your own shell; never paste them).
3. Domain and a corrections address (decision F). Until then, corrections go to GitHub issues.
4. A second reader for quotes of living people (decision E), and a legal review of the corrections
   and reply process (decision I).

## Later steps

- Step 8: coverage table and public candidate list (decision A); per-party symmetry report.
- Promote validator rules from todo to error as their counts reach zero (`RULES` in `src/lib/validate.ts`).
- Ingest pipeline: first run `npm run ingest -- --days 14 --dry` with an API key.

## Conventions

- Schema: `content/SCHEMA.md`, enforced by `src/lib/schema.ts` (Zod).
- Neutral voice. Describe, never judge. Contested facts: say so and cite each side.
- Never mark an entry checked without opening its sources. Do not name the minor complainant in the
  wrestlers entry.
- Commit messages end with `Co-Authored-By: Claude <model> <noreply@anthropic.com>`.

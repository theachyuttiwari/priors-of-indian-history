<img src="assets/icon.svg" width="64" height="64" alt="">

# Priors — what they did before

An open record of how Indian governments, across parties, have handled protests. Today's event, set beside the precedents. Every claim links to a dated source.

```
  LIVE EVENT ──► tagged by action type ──► PRECEDENT SHELF (1974 → now)
                                               │
                                               ▼
                               COMPARISON: party × action, in power vs in opposition
```

## Why

Memory is short and the record is long. A new generation sees today's crackdown or today's permission without the thirty cases before it. Priors puts them side by side.

## Three rules

1. Every claim links to a dated source. No source, no claim.
2. Every party gets the same columns. The schema enforces symmetry.
3. Describe actions. Do not judge them.

## Layout

| Path | What |
|---|---|
| `content/precedents/*.yaml` | One protest, one government's answer. Hand-written or pipeline-drafted, human-checked. |
| `content/current/*.yaml` | Events underway. Drafted by the pipeline, marked `reviewed: false` until checked. |
| `content/SCHEMA.md` | The schema and action-type vocabulary. |
| `src/` | Next.js static site. |
| `pipeline/ingest.ts` | Claude + web search finds recent events, structures them, writes YAML. |
| `pipeline/validate.ts` | Schema and source-reference checks. Runs in CI. |
| `docs/` | Landscape research and naming notes. |

## Run

```bash
npm install
npm run validate      # check content
npm run dev           # http://localhost:3000
npm run build         # static export to out/
```

## Ingest current events

```bash
export ANTHROPIC_API_KEY=...   # or: ant auth login
npm run ingest -- --days 14 --dry   # print, do not write
npm run ingest -- --days 14         # write to content/current/
```

A GitHub Action runs this daily and opens a pull request. Review the sources, set `reviewed: true`, merge.

## Contribute a precedent

1. Copy the shape in `content/SCHEMA.md`.
2. Open every URL you cite.
3. Run `npm run validate`.
4. Open a pull request.

## Licence

Code: MIT. Content: CC BY 4.0. Sources belong to their publishers.

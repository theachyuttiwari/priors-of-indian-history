<img src="assets/icon.svg" width="64" height="64" alt="">

# Priors — what they did before

[![CI](https://github.com/theachyuttiwari/priors-of-indian-history/actions/workflows/ci.yml/badge.svg)](https://github.com/theachyuttiwari/priors-of-indian-history/actions/workflows/ci.yml)
[![Code: MIT](https://img.shields.io/badge/code-MIT-lightgrey.svg)](LICENSE)
[![Content: CC BY 4.0](https://img.shields.io/badge/content-CC%20BY%204.0-lightgrey.svg)](content/LICENSE)

An open record of how the Indian state acts when different parties hold power. It starts with protest: today's event, set beside how earlier governments of every party handled the same kind of protest. Every claim links to a dated source.

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

| Path                        | What                                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------------------- |
| `content/precedents/*.yaml` | One protest, one government's answer. Hand-written or pipeline-drafted, human-checked.             |
| `content/current/*.yaml`    | Events underway. Added by hand or drafted by the pipeline, marked `reviewed: false` until checked. |
| `content/SCHEMA.md`         | The schema and action-type vocabulary.                                                             |
| `src/`                      | Next.js static site.                                                                               |
| `pipeline/ingest.ts`        | Claude + web search finds recent events, structures them, writes YAML.                             |
| `pipeline/validate.ts`      | Command-line wrapper for `src/lib/validate.ts`. Runs in CI.                                        |
| `tests/`                    | Unit tests for formatting, validation and the counting rules.                                      |
| `docs/`                     | Landscape research and naming notes.                                                               |

## Run

Needs Node 22 (see `.nvmrc`).

```bash
npm install
npm run dev           # http://localhost:3000
npm run build         # static export to out/
```

| Command                        | What it does                                                            |
| ------------------------------ | ----------------------------------------------------------------------- |
| `npm run check`                | Format, lint, typecheck, tests and content validation. Run before a PR. |
| `npm run validate`             | Schema and source-reference checks on `content/`.                       |
| `npm run validate -- --strict` | The same, but warnings fail too. CI runs this.                          |
| `npm test`                     | Unit tests (Vitest).                                                    |
| `npm run format`               | Format with Prettier.                                                   |

## Ingest current events

```bash
export ANTHROPIC_API_KEY=...   # or: ant auth login
npm run ingest -- --days 14 --dry   # print, do not write
npm run ingest -- --days 14         # write to content/current/
```

The site is static and refreshed by hand. "Last updated" dates come from git history. The `ingest.yml` workflow can be run by hand once the `ANTHROPIC_API_KEY` repo secret exists. It opens a pull request. Review the sources, set `reviewed: true`, merge.

## Contribute

- **Found an error?** Open a [correction request](https://github.com/theachyuttiwari/priors-of-indian-history/issues/new?template=correction.yml). Bring a source.
- **Missing a precedent?** [Suggest one](https://github.com/theachyuttiwari/priors-of-indian-history/issues/new?template=precedent.yml), or add it yourself:
  1. Copy the shape in `content/SCHEMA.md`.
  2. Open every URL you cite.
  3. Run `npm run check`.
  4. Open a pull request and fill in the checklist.
- **Before you start,** read [CONTRIBUTING.md](CONTRIBUTING.md) and the [editorial policy](docs/editorial-policy.md).
- **Security problem?** See [SECURITY.md](SECURITY.md).

## Licence

Code: [MIT](LICENSE). Content in `content/`: [CC BY 4.0](content/LICENSE). Quoted sources belong to their publishers. To cite the record, see [CITATION.cff](CITATION.cff).

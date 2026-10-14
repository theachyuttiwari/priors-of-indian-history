# Contributing to Priors

Priors is a record of how the Indian state has handled protests under every party. Every claim must
trace to a source that anyone can open. This guide tells you how to add to the record without
weakening that.

Read the [editorial policy](docs/editorial-policy.md) first. It says what gets in and how claims are
sourced. By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to help

| You have                  | Do this                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| An error, with a source   | Open a [correction request](https://github.com/theachyuttiwari/priors-of-indian-history/issues/new?template=correction.yml).                      |
| A protest that is missing | [Suggest a precedent](https://github.com/theachyuttiwari/priors-of-indian-history/issues/new?template=precedent.yml), or add it yourself (below). |
| A bug in the site         | Open a [bug report](https://github.com/theachyuttiwari/priors-of-indian-history/issues/new?template=bug.yml).                                     |
| A security problem        | Follow [SECURITY.md](SECURITY.md). Do not open a public issue.                                                                                    |

## Set up

You need Node 22 (see `.nvmrc`).

1. Run `npm ci`.
2. Run `npm run dev` and open the address it prints.
3. Before you open a pull request, run `npm run check`.
4. If you changed `src/`, also run `npm run build`.

## Add or change a precedent

Content is YAML in `content/precedents/` and `content/current/`. The full shape is in
[content/SCHEMA.md](content/SCHEMA.md).

1. Check the event against the four gates in the [editorial policy](docs/editorial-policy.md#what-gets-in).
2. Copy the shape from `content/SCHEMA.md` into a new file named `<short-name>-<year>.yaml`.
3. Open every URL you cite. Each source must support the exact claim it is attached to.
4. Give each source its `tier` and, for wire copy, its `wire` (see [How to source a claim](#how-to-source-a-claim)).
5. Mark each statement as `verbatim`, `translated` or `paraphrase`.
6. Run `npm run archive -- <short-name>` to record an existing Wayback Machine copy of each source.
   To capture pages that have none, add `--save`. This needs your own
   [archive.org S3 keys](https://archive.org/account/s3.php) in `IA_ACCESS_KEY` and `IA_SECRET_KEY`.
7. Run `npm run match-quotes -- <short-name>` to check that each quote appears in its source.
8. Run `npm run validate -- --todos <short-name>` and fix what it lists.
9. Leave `review: status: draft`. A reviewer changes it.
10. Open a pull request and fill in the checklist.

### How to source a claim

Priors rates evidence by its kind, not by the outlet. The same bar applies to every party.

| Tier        | Kind of evidence                                       | Examples                                              |
| ----------- | ------------------------------------------------------ | ----------------------------------------------------- |
| `record`    | The record of the act or the words                     | Section 144/163 order, gazette, FIR, Lok Sabha debate |
| `court`     | A court or inquiry record                              | Judgment, order, affidavit, commission report         |
| `recording` | A full recording or verbatim transcript                | Full video of a speech, press-conference transcript   |
| `report`    | A report by a named reporter, from their own reporting | A bylined report from the scene                       |
| `secondary` | Wire copy, unnamed byline, analysis                    | PTI, ANI or UNI copy, NGO reports, academic papers    |
| `lead`      | A lead to better sources. Never enough alone.          | Wikipedia, fact-checkers, aggregators                 |

Each claim needs a minimum of evidence:

| Claim (`claim:`) | Minimum                                                                                |
| ---------------- | -------------------------------------------------------------------------------------- |
| `ordered`        | One `record`, or one `court` record, or two independent sources at `report` or better. |
| `happened`       | One court finding, or two independent sources at `report` or better.                   |
| `held`           | The court record itself.                                                               |
| `said`           | One `record` or `recording`, or two independent sources at `report` or better.         |

Three more rules:

- **One wire story is one source.** PTI copy in five papers counts once. Two articles from one
  publisher also count once.
- **Official sources settle only what the state ordered or claimed.** They do not settle contested
  facts. When sides disagree, record both, each with its source.
- **Numbers are attributed.** Put counts in `figures`, each with who gave it: police, organisers, a court.

### Quotes

- Only `verbatim` and `translated` statements show quote marks. The `quote.text` must match the
  source word for word.
- A translated quote keeps the original words in `quote.original` and says who translated it.
  Machine translation of quotes is not allowed.
- Give a `locator`: a timestamp, a page or a paragraph.
- A `paraphrase` is Priors' own summary. It never carries a `quote`.
- The script checks the words. A person still checks the context, because a quote can be exact and
  still misleading when it is clipped.

### Voice

Describe. Do not judge. Words such as "excessive", "brutal" or "peaceful" appear only inside a quote,
with the speaker named.

## Change the code

- Design at 390 px width first, then check desktop. Check light and dark mode.
- Add or update tests in `tests/` for logic in `src/lib/` and `pipeline/`.
- Keep the site static. No tracking, no third-party scripts.

## Review

Only a reviewer changes `review.status`:

| Status     | Meaning                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| `draft`    | Not yet checked by a person. Shown with a Draft tag.                                                      |
| `checked`  | A person opened every source and checked every claim against it.                                          |
| `verified` | Checked, every quote matched in its archived source, and quotes of living people read by a second person. |

Do not review your own entry. When a checked or verified entry changes what it claims, the pull request
must add an item to its `corrections` list. CI enforces this. Label a pure typo fix `typo-only` to skip
the check.

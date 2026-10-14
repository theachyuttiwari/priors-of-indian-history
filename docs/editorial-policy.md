# Editorial policy

This policy says what Priors records, how each claim is sourced, and how errors are fixed. It applies
to every entry and every party in the same way.

> Status: adopted for phase 1 on 15 October 2026. The corrections and reply sections get one legal
> review before the public launch.

## What Priors is

Priors is a public record of how the Indian state acts when different parties hold power. Phase 1
covers one question: how do governments answer protest? It sets what a party does in government beside
what earlier governments did in the same situation, and beside what the same party said in opposition.

Priors describes. It does not judge. The reader judges.

## What gets in

An event gets in only if it passes all four gates. Anyone can apply the test, and the result does not
depend on which party was in power.

```
 1 A protest  ──▶  2 The state acted  ──▶  3 Significant  ──▶  4 Sourceable  ──▶  in the record
      │                  │                      │                  │
      └──────────────────┴──────────────────────┴──────────────────┴──▶ "considered, not included"
                                                                          with the gate it failed
```

1. **A protest.** People act together in public to press a demand on the Centre or a state government.
   This covers marches, sit-ins, dharnas, hunger strikes, bandhs, strikes, road and rail blockades and
   gheraos. It does not cover riots or communal violence with no demand on the state, armed insurgency,
   election rallies or purely online campaigns. A protest that turns violent stays in, and the record
   states both sides of what happened.
2. **The state acted.** At least one action from the closed list in `content/SCHEMA.md`. Permission
   granted and talks count too.
3. **Significant.** Any one of these public facts:
   - An official order was issued for it: Section 144 or 163, a curfew, an internet suspension or a ban.
   - A court issued an order or judgment about how the state handled it.
   - A legislature discussed it: a question, a motion or a debate.
   - Two independent outlets reported it on at least two separate days.
4. **Sourceable.** Its core actions meet the minimum evidence below.

The record starts on 26 January 1950, so every case sits under the same Article 19.

### Balance without quotas

Priors does not pick cases to make party numbers look even. That would be bias in the other direction.
Instead:

- A coverage table shows entries per party, per year in power, per state and per decade. Gaps stay
  visible.
- Candidates come from neutral sources, not memory: Section 144 and shutdown judgments, parliamentary
  questions, shutdown trackers and event datasets. The oldest and emptiest cells are filled first.
- A public candidate list marks each candidate as included, or not included with the gate it failed.

## How claims are sourced

Every claim links to a dated source. No source, no claim.

Priors rates each source by the kind of evidence it is, not by the outlet that published it. The tiers,
the minimum evidence for each kind of claim and the quote rules are in
[CONTRIBUTING.md](../CONTRIBUTING.md#how-to-source-a-claim). In short:

- What the state **ordered** needs the order, a court record or two independent reports.
- What **happened** needs a court finding or two independent reports.
- What a court **held** needs the court record.
- What someone **said** needs the record, a recording or two independent reports.
- Copies of one wire story count as one source.
- Official sources settle what the state ordered or claimed, not contested facts.
- Disputed numbers are shown with who gave each one.
- Wikipedia and fact-checkers are leads to better sources. They are never enough alone.

Each source gets a Wayback Machine copy, so a reader can still check it if the original page changes.
Priors does not use archive.today or its mirrors.

### No legal frame

Priors records the law the state used, for example Section 163 BNSS, and what courts later held. It
does not judge an action against Indian, US or any other country's free-speech law.

### Contested facts

When sides disagree, Priors records each account with its own source and says who gave it. It does not
pick a side in its own voice.

## Review states

Each entry shows where it stands:

| State    | Meaning                                                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------- |
| Draft    | Not yet checked by a person. It can be wrong. The source links are there so the reader can check.         |
| Checked  | A named person opened every source and confirmed each claim against it.                                   |
| Verified | Checked, every quote matched in its archived source, and quotes of living people read by a second person. |

Entries drafted with the help of an AI model say so, and stay Draft until a person checks them.

## Corrections

Anyone can ask for a correction. Bring a source.

1. Open a [correction request](https://github.com/theachyuttiwari/priors-of-indian-history/issues/new?template=correction.yml).
2. A maintainer checks the claim against the sources you give and the sources already cited.
3. If the entry is wrong, it is fixed, and the change is logged.

Every change to what a checked or verified entry claims is logged on the entry and on the public
Corrections page on the site (`/corrections/`). Each log
item has a date and one of three kinds:

| Kind          | Use it when                                                    |
| ------------- | -------------------------------------------------------------- |
| Correction    | The entry was wrong. An error is always a correction.          |
| Clarification | The entry was right but could be misread.                      |
| Update        | Something new happened, such as a court order or a withdrawal. |

Priors does not delete a logged correction. Drafts can change without a log, because they are not yet
claimed as checked.

## Right of reply

A person or party named in an entry can send a response through the correction form. If the response
disputes a fact and comes with a source, the entry records both accounts, each with its source. If the
response shows an error, it is handled as a correction.

## Contact

Until the project email address exists, all requests go through GitHub:

- Corrections and replies: the [correction form](https://github.com/theachyuttiwari/priors-of-indian-history/issues/new?template=correction.yml).
- Security problems: [SECURITY.md](../SECURITY.md).
- Conduct reports: see the [Code of Conduct](../CODE_OF_CONDUCT.md).

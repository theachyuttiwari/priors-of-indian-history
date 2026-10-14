# Priors content schema

Every precedent is one YAML file in `content/precedents/<slug>.yaml`.
Every claim must point to at least one source id. No source, no claim.

```yaml
id: farm-laws-2020 # kebab-case, unique, matches filename
title: Farm laws protest
summary: > # 2-4 neutral sentences
  ...
period:
  start: 2020-11-26 # YYYY-MM-DD (use YYYY-MM or YYYY if unknown)
  end: 2021-12-11 # null if ongoing
location:
  states: [Delhi, Punjab, Haryana]
  places: [Singhu border, Tikri border]
protest:
  cause: Repeal of three farm laws
  organisers: [Samyukt Kisan Morcha]
  scale: Tens of thousands camped at Delhi borders for a year
government:
  centre:
    party: BJP
    alliance: NDA
    head: Narendra Modi
    role: Prime Minister
  state: # optional; the state govt that handled policing
    party: AAP
    head: Arvind Kejriwal
    role: Chief Minister
    name: Delhi
actions: # what the government did, one entry per action
  - type: internet_shutdown # see ACTION TYPES below
    date: 2021-01-26
    description: Internet suspended at Singhu, Ghazipur and Tikri after the tractor rally
    actor: centre # centre | state | police | court
    sources: [s1]
  - type: negotiation
    date: 2020-12-01
    description: Eleven rounds of talks between ministers and farm unions
    actor: centre
    sources: [s2]
outcome: >
  Laws repealed by Parliament on 29 Nov 2021.
positions: # what parties and leaders said, in power or not
  - party: INC
    person: Rahul Gandhi
    role_at_time: Lok Sabha MP, opposition
    in_power: false
    date: 2020-12-24
    statement: "..." # short direct quote or close paraphrase
    sources: [s3]
sources:
  - id: s1
    title: Internet suspended at Delhi borders
    publisher: The Hindu
    url: https://...
    date: 2021-01-30
    type: news # news | court_judgment | official | academic | book | archive
tags: [farmers, delhi, internet_shutdown]
```

## ACTION TYPES (use exactly these)

permission_denied, permission_granted, section_144, curfew, internet_shutdown,
detention, preventive_arrest, fir, sedition_charge, uapa_charge, nsa_detention,
lathi_charge, tear_gas, firing, barricading, negotiation, concession, repeal,
censorship, surveillance, property_demolition, house_arrest, deportation,
commission_of_inquiry, other

## RULES

1. Neutral voice. Describe actions, do not judge them.
2. Every action and position lists at least one source id.
3. Sources must be real URLs you have opened. Prefer primary: court orders,
   gazette notifications, PIB, Hansard-style records, then major newspapers.
4. If a fact is contested, say so in the description and cite both sides.
5. Dates are ISO. Unknown day: use YYYY-MM.
6. Party names: INC, BJP, CPI(M), CPI, AAP, TMC, DMK, AIADMK, SP, BSP, RJD, JD(U),
   SAD, SS (Shiv Sena), NCP, TDP, YSRCP, BJD, BRS, JMM, NC, PDP, Janata Party,
   Janata Dal, other (write the full name).

## EVIDENCE (phase 1 rules, decision B)

Rate each source by the kind of evidence it is, never by the outlet. The same bar applies to every party.

| `tier`      | Rank | Kind of evidence                                                                |
| ----------- | ---- | ------------------------------------------------------------------------------- |
| `record`    | T1   | The order, gazette, FIR, PIB release, edited debate, or the speaker's own words |
| `court`     | T2   | Judgment, court order, affidavit, inquiry or commission report                  |
| `recording` | T3   | Full recording or verbatim transcript                                           |
| `report`    | T4   | Contemporaneous report with a named reporter, from the outlet's own reporting   |
| `secondary` | T5   | Wire copy, unnamed byline, analysis, NGO or academic report                     |
| `lead`      | T6   | Wikipedia, fact-checks, aggregators. Never enough alone                         |

Wikipedia and known fact-check sites are `lead` whatever `tier` says.

```yaml
sources:
  - id: s1
    title: ...
    publisher: The Tribune # the outlet that published this copy
    wire: PTI # PTI | ANI | UNI | IANS | Reuters | AFP | AP, when the text is wire copy
    author: Jane Doe # named reporter; without one, a news report is secondary
    tier: report
    language: en # ISO 639-1
    url: https://...
    date: 2021-01-30
    archive_url: https://web.archive.org/web/2021.../https://... # never archive.today
    archive_date: 2021-01-31
    accessed: 2026-10-15
```

### Minimum evidence per claim

The validator infers the claim kind from the action type and actor. Set `claim:` to override it.

| Claim                                     | Minimum                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `ordered`: the state ordered or decided X | one `record`, or one `court`, or two independent at `report` or better |
| `happened`: a physical event              | one `court`, or two independent at `report` or better                  |
| `held`: what a court held                 | one `court`                                                            |
| said: every statement in `positions`      | one `record` or `recording`, or two independent at `report` or better  |

Copies of one wire story count as one source. Two articles from one publisher count as one.

### Actions: law, courts and numbers

```yaml
actions:
  - type: section_144
    legal_basis: Section 163 BNSS # as named in the order
    court_outcomes:
      - summary: The High Court set the order aside. # one neutral line
        source: s4
    figures: # every disputed number, with who gave it
      - { what: detained, value: "more than 2,000", claimed_by: police, source: s2 }
      - { what: detained, value: "more than 15,000", claimed_by: organisers, source: s3 }
```

Words like "excessive" or "peaceful" appear only inside a quote with the speaker named.

### Statements: verbatim, translated or paraphrase

```yaml
positions:
  - party: Party A
    in_power: false
    kind: translated # verbatim | translated | paraphrase
    statement: Opposed the order. # Priors' own summary, never shown in quote marks
    quote: # required for verbatim and translated; only this text gets quote marks
      text: "..." # the exact English words as published
      original: "..." # required for translated: the words in the original language
      language: hi
      translated_by: source # source | priors. Machine translation is not allowed
      locator: "11:06" # timestamp, paragraph or page
      source: s3 # must also be in sources
    sources: [s3]
```

### Review and corrections

```yaml
review:
  status: draft # draft | checked | verified (verified needs by and date)
  by: reviewer-github-handle
  date: 2026-10-20
corrections:
  - date: 2026-11-02
    kind: correction # correction | clarification | update. An error is always a correction
    note: The order was issued on 9 October, not 10 October.
```

### Rules being phased in

Some rules start as **todos**. `npm run validate` counts them but does not fail. List them with
`npm run validate -- --todos [file]`. When the content passes a rule, set it to `"error"` in `RULES` in
`src/lib/validate.ts`, so it can never regress.

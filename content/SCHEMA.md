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

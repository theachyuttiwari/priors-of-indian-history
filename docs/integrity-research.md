# Citation and quote integrity: research and recommendations

Date: 2026-10-15. Status: research note for the owner. No code or content was changed.

```
How one claim becomes "rock solid"

 claim ──► claim type ──► minimum evidence tier ──► source(s)
 (action,    (ordered /     (T1 record of the act    │  url + archive_url + accessed
  position,   said /         ... T6 lead only)       │  language + wire + excerpt
  number)     happened /                             ▼
              number)                         validator (code)
                                              - excerpt found in archived text
                                              - quote kind set; translation has original
                                              - no Wikipedia / fact-check as sole source
                                              - independent sources counted by wire
                                                     │
                                                     ▼
                                              human review (checklist, 2nd reader
                                              for named-person quotes) ──► publish
                                                     │
                                                     ▼
                                              corrections log + link/drift check
```

## 1. The short answer

Make each claim carry its own proof, and make the code refuse claims that do not. Every source gets
an archived copy, an access date, a language and the exact sentence (`excerpt`) that supports the
claim. Every statement says what it is: verbatim, translated (with the original text) or a paraphrase.
Only verbatim and translated text goes inside quote marks. Rank evidence by what it is (the order
itself, the court record, the recording of the speaker, a named reporter's report), not by which outlet
ran it. Count copies of one wire story as one source. Never let Wikipedia or a fact-checker be the only
source. The validator checks all of this automatically, including that each quote string appears in
the archived source text. A human then checks meaning and context, which code cannot do. A public
corrections log records every later change. Today 54 of 153 statements are paraphrases shown as
quotes, 129 of 153 statements rest on one source, and no source has an archive copy, so the first
three steps give the most value.

## 2. What others do

Notes on method. Five research agents opened each URL on 2026-10-15. Items marked † were read
through a fetch tool that summarises the page. The page loaded, but check the exact wording before
you quote it in public. Section 6 lists every URL.

### 2.1 Wikipedia (encyclopedic policy)

What they do:

- The editor who adds material carries the burden of proof (WP:V). [W1]
- Wikipedia does not accept itself as a source, and it warns that some news outlets copy Wikipedia
  ("circular sourcing"). [W1, W2]
- A primary source can support only "straightforward, descriptive statements of facts". Any
  interpretation needs a secondary source (WP:PRIMARY). [W3]
- Contentious material about living people that is unsourced or poorly sourced "must be removed
  immediately". Editors do not tag it; they remove it (WP:BLP). [W4, W5]
- Quotes must be "faithfully reproduced". Translations "should be explicitly distinguished" from
  original text. When editors translate, the original goes with the translation. Editors "should not
  rely upon machine translations" in contentious articles or biographies of living people. [W1, W6, W7]
- Copies of one wire story are "essentially a single source". Syndicated pieces "are not independent
  of one another". [W2, W8]
- Citation templates carry `archive-url` and `archive-date`. InternetArchiveBot and volunteers had
  rescued more than 9 million dead links by 2018. [W9, A6]

What worked: archive at the time of citing; the BLP rule to remove instead of tag; the wire rule.

What failed or needs care: the perennial-sources list (WP:RSP) rates outlets. ANI sued the
Wikimedia Foundation over its Wikipedia description; the Supreme Court set aside the High Court's
broad takedown order in 2025. [W10, L14, L15] In 2026 Wikipedia deprecated archive.today after
evidence that its operators altered archived pages. About 695,000 links had to go. [A3, A4, A5]

### 2.2 Fact-checkers

**IFCN Code of Principles.** Signatories commit to nonpartisanship, transparent sources, funding and
methodology, and an open corrections policy. Independent assessors check 31 criteria each year. [F1, F2]
On 2026-10-15 the IFCN list showed BOOM, Factly, Newschecker and Vishvas News as verified, and Alt News
as "expired" (last approved 2019). Expired status can mean no renewal; it is not proof of withdrawal. [F3]

**PolitiFact.** It publishes a list of sources with every fact-check. Its Flip-O-Meter rates
consistency on one issue: No Flip, Half Flip, Full Flop. PolitiFact says the rating "is not making a
value judgment" about a change of position. Corrections are marked at the top (major) or bottom (minor);
updates are labelled separately. [F4†] This is the closest analog to Priors' "said vs did". Priors
should copy the neutral framing, not the rating scale.

**Full Fact.** It links "primary sources for all factual assertions wherever possible" and prefers
legal documents and data tables to press releases. It keeps one dated public corrections log that
links each correction to its article. Its AI tools match new claims against old checks, and it says
human experts stay in the loop. [F5, F6, F7, F8]

**Indian fact-checkers.** Alt News reviews "original video or transcript" to see if a statement was
clipped. BOOM says so when it cannot prove or disprove a claim. Factly links the claim source in every
story. Newschecker has a reviewer for parity across languages, and labels CORRECTION separately from
UPDATE. Vishvas News publishes a numbered, dated corrections log. [F9-F15] None of them publishes a
written rule for showing the original Hindi or regional text next to a translation. [F-gap] The Quint's
Kharge fact-check is a good model for timestamps (it gives about 11:06 in the full video), but it gives
the quote in English only. [F16]

**Limits of fact-checkers as sources.** Two US fact-checkers checked the same statement in only about
one in ten cases (Lim 2018). Snopes and PolitiFact overlapped on 6.5% of claims, but agreed on almost
all of the overlap. [F17, F18] So fact-checkers are uneven in what they choose to check, more than in
their verdicts. This supports using them as leads to primary evidence. Fact-checkers also face legal
risk in India: Delhi Police arrested Alt News co-founder Mohammed Zubair in June 2022 over a 2018
tweet. The Supreme Court granted him bail in all FIRs in July 2022. [F19, F20, F21]

### 2.3 Event and incident databases

**ACLED.** Every event has at least one source. When reports conflict on fatalities, ACLED records
the most conservative figure and notes the dispute. It does not verify fatality figures itself. Three
human review stages run before weekly release. [D1†, D2†, D3] An internal audit found errors in fewer
than 1% of labels. [D4] An outside study warned of uneven quality for sub-national analysis. [D5†]

**SFLC.in internet shutdown tracker.** Most data comes from national and regional newspapers. One
order counts as one shutdown, even across districts. RTI requests have produced actual orders in some
cases. [D6†, D7, D8†] The tracker showed 934 shutdowns on 2026-10-15, but its entries cite news, not
orders. [L22]

**Access Now #KeepItOn / STOP.** Sources include the coalition, network measurement, news and official
orders, checked by hand. There are no confidence grades, but fields mark a start date as "Actual" or
"Estimated" and allow an "Unknown" status. [D9†]

**Article 14, "A Decade of Darkness" (sedition).** Built by hand from about 1,300 legal documents, 800
media reports and 125 FIRs, plus interviews. [D10, D11†, D12†] The site footer still reads "Last
updated ... 09.02.2022". [D10]

**Mapping Police Violence.** Two reviewers must approve each record before it is published. The team
waits about two weeks because "initial accounts ... often come solely from police sources". Records are
"living" documents with a public email for errors. Its own review found the old process relied too
much on single researchers. [D13]

**Washington Post, Fatal Force.** Built from local news, police sites and other databases. It found
more than twice as many fatal police shootings per year as federal data. The Post now tracks only
2015 to 2024. [D14]

**The Guardian, The Counted (2015-16).** Reporters made thousands of inquiries and records requests
to verify tips. The project led the US Justice Department to start a program that mirrored it. [D15,
D16, D17] The Guardian did not publish its own reason for stopping (gap).

**IndiaSpend / FactChecker Hate Crime Watch.** It tracked religion-based hate crimes from 2009 and went
offline on 11 Sep 2019. The stated and reported reasons conflict: FactChecker said it had "outgrown its
purpose"; Newslaundry's sources cited a resource crunch, staff departure and funder pressure. [D18†,
D19†] No methodology page survives in the sources found.

**GDELT (cautionary).** A 2016 _Science_ paper found high duplication from re-reported events, and that
only 21% of valid GDELT protest URLs showed a true protest event. [D20]

What worked across these: written counting rules; conservative and attributed figures; two or more
human reviewers; primary records through RTI or records requests; a delay before publishing.
What failed: projects run by one small team ended (The Counted, Hate Crime Watch, Fatal Force);
fully automated coding (GDELT) produced noise; un-updated sites go stale.

### 2.4 Records of what politicians said

**TheyWorkForYou (UK).** Every speech has its own permalink and comes from the official Hansard feed.
When Parliament corrects the record, the site picks up the correction on the next import. [P1, P2]

**Factbase.** Transcripts give a time range for each speaker turn, link to the video at that time,
and note that each transcript "was cross-checked". [P3]

**PRS Legislative Research.** Bill pages give dated stages and link the bill text in English and Hindi
and the gazette notifications. PRS says it does not warrant accuracy, so cite the primary PDF it links
to. [P4]

**Lok Sabha and Rajya Sabha debates (sansad.in).** Lok Sabha prepares Hindi, English and "Original"
versions. The Original holds speeches as spoken; speeches in other Indian languages are translated. So
an English quote of a Hindi speech from the English version is the Secretariat's translation. "Uncorrected"
debates go online the next day; edited ones take 10-15 days. The synopsis "is not an authoritative
record". [P5] The Rajya Sabha disclaimer requires "faithful verbatim reproduction" and says
reproduction "would afford no protection against any legal proceedings". [P6] eparlib.nic.in did not
resolve during this research (gap).

**PIB.** Each language version of a release has its own ID (for example Hindi 2100000, English
2099917). Record the ID of the version you quote. [P7]

**Ballotpedia.** Its policy pages blocked all fetch methods. A press profile quotes staff saying that
everything is "very, very thoroughly cited". [P8] Not enough to draw lessons from.

### 2.5 Open-source investigation

**Berkeley Protocol (OHCHR, 2022).** At collection, record the URL, the HTML source and a full-page
capture, the collector, and a time stamp. Add a hash value at collection and check hashes on samples
later. Keep a chain of custody. For internal work only, a screenshot or PDF can be enough. [O1]

**Bellingcat.** Its Auto Archiver takes a screenshot and can store a hash to detect later tampering; by
2025 it had preserved 150,000 items. On its Ukraine harm map, items it could not corroborate were not
shown, and it did not confirm claims of responsibility. [O2†, O3†, O4†]

### 2.6 Link preservation

```
Failure rates of live links (no archive)
 Supreme Court opinions (US)        ~50% do not link to the cited info   [A8]
 Harvard Law Review + journals      >70%                                 [A8]
 Web pages from 2013, by 2023       38% gone                             [A9]
 Wikipedia pages, >=1 dead ref      54%                                  [A9]
 References with content drift      >75%                                 [A11]
```

- **Wayback Machine SPN2 API.** POST to `https://web.archive.org/save` with S3-style keys. Limits:
  about 7 captures a minute and 30,000 a day when authenticated; the same URL about 5 times a day. The
  official doc contradicts itself on some limits. [A1]
- **archive.today.** Deprecated on Wikipedia in 2026 (see 2.1). Do not use it. [A3, A4]
- **Perma.cc.** Run by Harvard Law School Library. Free for courts and academic institutions; paid
  for others. Existing links stay up if a subscription ends. [A7]
- **Robust Links.** Store the original URL, the snapshot URL and the date of linking together
  (`data-versionurl`, `data-versiondate`). [A10] It names two problems: link rot and content drift.
- **Silent edits.** NewsDiffs, diffengine and the NewsEdits dataset (4.6 million versions of 1.3
  million articles) show that news articles change after publication at scale. [A12, A13, A14]
- **Pew 2024.** About a quarter of pages that existed between 2013 and 2023 are gone. [A9]

### 2.7 Corrections

- AP: "A correction must always be labeled a correction." No euphemisms such as "fixes" or
  "clarifies". [Q2]
- The Guardian code separates a correction (an error) from a clarification (a piece that misleads). [C1]
- PolitiFact, Full Fact and Newschecker all keep "update" (new information) separate from
  "correction" (an error). [F4†, F6, F13]
- Full Fact and Vishvas News publish dated, linked corrections logs. [F7, F15]
- Press Council of India norms: correct "promptly with due prominence"; check imputations with the
  person concerned before publishing; publish a reply "free of cost". [L9]
- The Hindu has a Readers' Editor; Scroll lists a readers' editor email. [L10, L11]

### 2.8 Quote handling

- Reuters: "Quotes are sacrosanct." Always give context. Beware of translating newspaper pickups back
  into the original language. Never "cite sources in the plural when we have only one". [Q1]
- AP: do not alter quotes, even grammar. If a quote's meaning is too murky to paraphrase accurately,
  do not use it. Translate faithfully and note the language. [Q2]
- Guardian: "If you aren't sure of the exact wording, use indirect speech." [Q3]
- Wikipedia: translations marked as translations, with the original text in the note. [W6, W7]

### 2.9 LLM-specific risks

- _Mata v. Avianca_ (S.D.N.Y. 2023): lawyers filed "non-existent judicial opinions with fake quotes and
  citations" from ChatGPT and were fined $5,000. [M1]
- Indian courts: the Bombay High Court quashed a tax assessment that relied on non-existent judgments
  (2025). The Supreme Court in 2026 said reliance on fake judgments may be misconduct and appointed an
  amicus. [M2, M3]
- Measured accuracy: generative search engines fully supported only 51.5% of sentences with their
  citations (Liu et al. 2023). Eight AI search tools gave wrong answers to more than 60% of
  news-citation queries (Tow Center 2025). [M4, M5†, M6]
- Anthropic's Citations API guarantees "valid pointers to the provided documents" and returns
  `cited_text` from the document. It works only on documents you pass in, and it "cannot be used"
  with structured outputs. Web search citations give up to 150 characters of `cited_text`. [M7, M8]
  The Priors ingest pipeline uses structured output (`zodOutputFormat`) in its second step, so the
  structured step cannot carry citations. A separate check is needed.
- No published source was found for exact or fuzzy quote matching against fetched text. It is a
  common engineering method; treat it as design, not as a sourced finding.

### 2.10 Indian legal exposure (brief; not legal advice)

- Criminal defamation is now Bharatiya Nyaya Sanhita s.356. Truth is a defence only if the imputation
  is "for the public good". Good-faith opinion on a public servant's public conduct is an exception,
  "and no further". The court-report exception does not mention Parliament. [L1]
- The Supreme Court upheld criminal defamation in _Subramanian Swamy v Union of India_ (2016). [L2]
- IT Rules 2021 Part III binds digital news publishers to Press Council norms, with a three-level
  grievance system. The Bombay High Court stayed rules 9(1) and 9(3) in August 2021; current status not
  confirmed. The 2023 Fact Check Unit amendment was struck down in _Kunal Kamra v UoI_ (2024). [L4-L8]
- A wrongly attributed quote fits neither the truth nor the opinion defence. So quote accuracy is the
  main legal protection, plus prompt correction and a right of reply (PCI norms 9, 34, 41). [L9]

## 3. Source ranking that does not depend on outlet ideology

The owner asked for a ranking that does not rely on which side an outlet is seen to favour. The
research supports the proposal, with three refinements. No source contradicts it outright.

### 3.1 Rate the evidence item, not the outlet

Outlet ratings correlate with one another (Lin et al. 2023), but they draw legal and political
challenge: ANI v Wikimedia Foundation in India, and the FTC demand to NewsGuard in the US. [R1, R2, L14]
Media-bias charts do not rate editorial standards explicitly (Poynter). [R3] Rating each item by what
kind of evidence it is avoids that dispute and applies the same bar to every party.

### 3.2 Evidence tiers (refined)

| Tier | Evidence type                                              | Examples                                                                                                                                           |
| ---- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1   | Record of the act or words itself                          | Section 144/163 order, shutdown order, gazette, FIR, PIB release, finally edited Lok/Rajya Sabha debates, the speaker's own video or verified post |
| T2   | Court or inquiry record                                    | Judgment, order, affidavit, commission report                                                                                                      |
| T3   | Recording or verbatim transcript by a third party          | Full video of a speech, press-conference transcript                                                                                                |
| T4   | Contemporaneous news report, named reporter, own reporting | Bylined report from the scene                                                                                                                      |
| T5   | Wire copy, unnamed byline, secondary analysis, NGO report  | PTI/ANI/UNI copy, HRW or Amnesty report, academic paper                                                                                            |
| T6   | Lead only, never cited alone                               | Wikipedia, fact-checkers, aggregators, tweets quoting someone else                                                                                 |

Refinements to the owner's draft:

1. **The ladder depends on the claim type.** WP:PRIMARY lets a primary record support only plain
   descriptive facts. [W3] A court record is T1 for what the court held, but not for what a politician
   said outside court.
2. **Wire copy and unnamed bylines drop to T5.** WP:RSP flags "generic bylines" as a paid-news warning
   sign in India. Newslaundry showed ANI press releases published unedited under ANI's byline. ANI and
   TOI pulled a wrong story without explanation in 2018. [W10, R4, R5, R6]
3. **Fact-checkers are T6 because of what they choose to check, not because their verdicts disagree.**
   [F17, F18] Use them to find the primary video or document, then cite that.

### 3.3 Claim types and the minimum evidence each needs

| Claim type         | What it covers                                         | Minimum to publish                                                           | Notes                                         |
| ------------------ | ------------------------------------------------------ | ---------------------------------------------------------------------------- | --------------------------------------------- |
| `ordered`          | What the state ordered, and the legal basis it invoked | One T1, or one T2 quoting the order, or two independent T4                   | Official sources are authoritative here       |
| `said`             | What a named person said                               | One T1 or T3 with a locator, or two independent T4 that quote the same words | Living person: second human reader            |
| `happened`         | Physical events (lathi charge, firing, detentions)     | Two independent sources at T4 or better, or one T2 finding                   | If sides disagree, state both, attributed     |
| `number`           | Counts: crowd, injured, dead, detained                 | Each figure attributed to who gave it                                        | Never one number in Priors' voice if disputed |
| `held`             | What a court later held                                | T2                                                                           | The judgment itself                           |
| `characterisation` | Words like "excessive", "peaceful"                     | Only as an attributed quote                                                  | Never in Priors' voice                        |

Support: BBC guidelines require statistics to be "attributed" and unverified material to be attributed.
[R7] Full Fact notes organisers and police both have reasons to differ on crowd sizes. [R8] In the
Ramlila Maidan judgment, police and the Home Secretary gave different crowd figures, and the amicus and
the record gave different force sizes. [L16] ACLED takes the lowest figure and notes the dispute; Priors
should show every figure with its claimant instead. [D2†] NPR chose to describe the scene instead of
printing partisan counts; that is a valid fallback when no figure is reliable. [R9]

### 3.4 Independence rule

Two sources count as two only if neither copies the other. Copies of one PTI, ANI, UNI, IANS, Reuters
or AFP story count as one. A story that cites another outlet counts as that outlet. This is WP:RS and
WP:SYNDICATED almost word for word. [W2, W8] The Indian cases add a reason: corrections to wire copy do
not reach every copy. [R5, R6] Priors' data already shows the problem: "Oneindia (UNI)" (13 sources) and
"UNI via Oneindia" (10 sources) are the same wire written two ways.

### 3.5 Official sources

An official order is authoritative for what the state ordered and the reason it gave. It is not
authoritative for contested facts. In _Anuradha Bhasin_ (2020) the State first claimed privilege and
placed "only sample orders" on record; the Court directed that all Section 144 and suspension orders be
published. [L17] IFF's RTI replies from Andhra Pradesh and Gujarat showed non-compliance. [L18] The
Centre told a parliamentary committee it keeps no central database of shutdowns. [L19] The 2024
Telecom Suspension Rules say orders "shall be published", but SFLC.in reports that Manipur's 2023 orders
were not published proactively. [L20, L21] So official records are often missing; record that a T1
order was sought and not found, and fall back to the claim-type minimum.

### 3.6 Symmetry audit

Use one bar for every party. Publish counts by party: statements, tiers, in power vs in opposition, and
single-source share. Ad Fontes uses politically balanced review panels; that is a procedural model for
the human review step. [R10] Current data: 71 statements in power, 82 in opposition. The validator can
print the per-party tier table on each run.

### 3.7 Legal frame: record, do not import

Indian free-speech law differs from US law. _Shreya Singhal_ (2015) states it: "under the US
Constitution, speech may be abridged, whereas under our Constitution, reasonable restrictions may be
imposed." [L12] Article 19(2) lists the grounds, including public order. [L13] The Constitution (First
Amendment) Act, 1951 substituted clause (2) after _Romesh Thappar_ (1950). [L23, L24] Priors should not
judge actions against either frame. For each action it should record:

1. the legal basis the state invoked (for example Section 144 CrPC, Section 163 BNSS, Telecom
   Suspension Rules 2024, NSA, UAPA), from the order where possible; and
2. what courts later held, with the judgment as source. Examples: _Ramlila Maidan_ (2012) held Section
   144 applies "only in emergent situations" and also found the protest trust partly negligent;
   _Mazdoor Kisan Shakti Sangathan_ (2018) held repeated Section 144 orders at Jantar Mantar
   amounted to "banning". [L16, L25]

## 4. Recommendations for Priors

Ranked by value for effort. "Code" means the validator (`src/lib/validate.ts`, `checkEntry`) or CI
can enforce it. "Human" means a reviewer must do it.

```
value
 high │ 1 kind   2 archive  3 no-wiki-alone      5 excerpt+match   6 tiers+claims
      │ 4 translation fields                     11 pipeline guard
  med │ 7 corrections  8 review record  10 symmetry     9 figures+legal  12 link/drift job
  low │                                                   13 hashes/snapshots
      └────────────────────────────────────────────────────────────────────────► effort
        low                                         medium               high
```

### 4.1 Statement `kind` and honest rendering (high value, low effort)

Schema change to `positions[]`:

```yaml
positions:
  - party: INC
    person: Rahul Gandhi
    in_power: false
    date: 2020-12-24
    kind: paraphrase # verbatim | translated | paraphrase
    statement: "Called the farm laws ..." # paraphrase: Priors' words, no quote marks
    quote: # required if kind is verbatim or translated
      text: "..." # exact words as published (English)
      original: "..." # required if translated: text in the original language
      language: hi # ISO 639-1 of the original
      translated_by: source # source | priors   (machine not allowed)
      locator: "11:06" # timestamp, paragraph or page
      source: s3
    sources: [s3]
```

- Code: `kind` required (error once migration is done; warning until then). `quote` required for
  verbatim/translated. A paraphrase that starts with "Said", "Called", "Urged" and so on but is marked
  verbatim gives a warning. `translated` requires `original`, `language`, `translated_by`.
- UI: only `quote.text` goes inside quote marks. Paraphrase renders as plain text with a small label
  "Paraphrase". Translated quotes show "Translated from Hindi by [source or Priors]" and a toggle to
  show the original. Affected files: `src/app/compare/page.tsx`, `src/app/parties/[party]/page.tsx`.
- Human: read the full context; check the quote is not clipped (the Kharge case [F16]).
- Migration: 54 of 153 statements start with a reporting verb. Mark these `paraphrase` now. Many
  contain short quoted fragments; move each fragment to `quote.text` only after it is matched.

### 4.2 Archive every source (high value, low effort)

New fields on `sources[]`: `archive_url`, `archive_date`, `accessed`.

- Code: error if `archive_url` host is archive.today, archive.ph or archive.is. Warning (later error)
  if `archive_url` or `accessed` is missing. Error if `accessed` is before `date`.
- Tool: a script `pipeline/archive.ts` that calls SPN2 for each source without an archive, with S3
  keys and the documented rate limits. [A1] Perma.cc is an option for the most important T1 records if
  the owner pays. [A7]
- UI: each source shows "original" and "archived [date]" links, in the Robust Links pattern. [A10]

### 4.3 Wikipedia and fact-checkers as leads only (high value, low effort)

- Code: error if every source for an action or position is Wikipedia, a Wikipedia mirror or a
  fact-check site (domain list). Today 18 actions and 9 positions rest only on Wikipedia, in 5 files.
- Human: follow the Wikipedia or fact-check citation to its source and cite that.

### 4.4 Language fields for every source (high value, low effort)

- `language` on each source (default `en`). For Lok Sabha debates, cite the Original version for
  Hindi speeches, and mark the English version as the Secretariat's translation. [P5] For PIB, record
  the language-specific PRID. [P7]
- Code: `translated` quotes must cite a source whose `language` matches `quote.language`, or a T1/T3
  English source that itself states it is a translation.

### 4.5 Excerpt and automatic quote matching (high value, medium effort)

- New field `sources[].excerpt` (or per-claim `excerpt`): the exact sentence(s) in the source that
  support the claim, like Wikipedia's `quote=` parameter.
- Code (script, run in CI and before `reviewed: true`): fetch the archived copy, strip HTML, normalise
  whitespace, quotes, dashes and Unicode (NFC), then check that `quote.text` and `excerpt` appear in the
  text. Exact match passes. A fuzzy match above a threshold gives a warning with the closest passage.
  No match is an error. Cache fetched text in `/tmp` or a gitignored folder, not in the repo, until the
  owner decides on snapshots (see open questions).
- Limit: matching proves the words exist in the source. It does not prove they are not clipped, or
  that the source attributes them to the right person. That stays human.

### 4.6 Evidence tier, claim type and independence (high value, medium effort)

- `sources[].tier` (T1-T6, or named values: `record`, `court`, `recording`, `report`, `secondary`,
  `lead`). Keep `type` for compatibility; note that today `type: archive` is used for both Wikipedia and
  HRW reports, so it does not carry meaning.
- `sources[].wire`: PTI | ANI | UNI | IANS | Reuters | AFP | AP | null. `sources[].author` for the
  named reporter.
- `actions[].claim` and an implied `said` claim for positions. Code checks the minimum in table 3.3,
  counting independent sources by `wire` (or by `publisher` when `wire` is null).
- Code: normalise `publisher` against a list (so "UNI via Oneindia" becomes publisher Oneindia, wire UNI).

### 4.7 Corrections log (medium value, low effort)

- Per entry: `corrections: [{date, kind: correction | clarification | update, note}]`. Use AP's rule:
  an error is always called a correction. [Q2]
- Site: a `/corrections` page, newest first, each line linked to the entry, as Full Fact does. [F7]
- Code (CI on pull requests): if a published entry (`reviewed: true`) changes a `statement`,
  `quote`, `description` or `date`, require a new `corrections` item. Typo-only changes can be exempt
  with a label.
- Site footer: a contact address for corrections and right of reply, matching PCI norm 41. [L9]

### 4.8 Review record instead of a boolean (medium value, low effort)

- Replace `reviewed: true|false` with `review: {status: draft | checked | verified, by, date}`. Keep
  `reviewed` as a derived value for now so the current UI works.
- Code: `verified` requires `by` and `date`, every quote matched (4.5), and every source archived.
- Human checklist for `verified`:
  1. Open the archived copy of every source.
  2. Confirm each quote is in the source and attributed to the same person.
  3. Read the surrounding context. Confirm the quote is not clipped.
  4. For a translated quote, compare with the original text.
  5. Confirm the statement date is the date it was said, not the report date.
  6. For a named living person, ask a second reader to repeat steps 2-4.
  7. Look for the state's side of each contested fact, and cite it if found.
  8. Confirm each number is attributed to whoever gave it.
  9. Confirm no characterisation is in Priors' own voice.

### 4.9 Attributed figures and legal basis (medium value, medium effort)

- `actions[].figures: [{what, value, claimed_by, source}]`. UI: "Police: 20,000 · Home Secretary:
  60,000".
- `actions[].legal_basis` (string, for example "Section 163 BNSS") and `actions[].court_outcome`
  (source id of a later judgment, plus a one-line neutral summary).
- Code: if an action description contains digits next to words such as "killed", "injured",
  "detained", "protesters", warn when no `figures` entry is present.

### 4.10 Symmetry report (medium value, low effort)

- Code: `npm run validate` prints, per party, the count of statements and actions by tier, by
  `in_power`, and the single-source share. No pass/fail; publish the table on the About page.
- Human: compare the bar used for government-side and opposition-side statements each release.

### 4.11 Guard the LLM pipeline (high value, medium effort)

- Step 1 (research): keep web search, but for each URL used, fetch the full page and archive it.
- Step 2 (structure): structured output cannot carry citations, so after it runs, call the 4.5 matcher.
  Any quote that does not match is downgraded to `kind: paraphrase` with a warning, or dropped.
- Never let the pipeline set `kind: translated` with `translated_by: priors`; machine translation is
  not allowed for quotes (WP:NOENG). [W1]
- Pipeline output stays `review.status: draft`.

### 4.12 Scheduled link and drift check (medium value, medium effort)

- A weekly CI job requests each original URL. It records the HTTP status and, where possible, a hash
  of the extracted text. A changed hash on a cited page opens an issue to re-check the excerpt.
- No build failure; this produces a report.

### 4.13 Snapshot hashes (lower value now, medium effort)

- Following the Berkeley Protocol [O1], store a SHA-256 of the archived text with each source. This
  matters only if Priors later stores snapshots or faces a challenge to a quote. Depends on the open
  question about storing text.

### What code can and cannot enforce

| Check                                                             | Code                                | Human           |
| ----------------------------------------------------------------- | ----------------------------------- | --------------- |
| Field present: kind, quote, archive_url, accessed, language, tier | yes                                 |                 |
| Quote string present in archived source                           | yes (string match)                  |                 |
| Quote attributed to the right person in the source                | partly (speaker name near excerpt)  | yes             |
| Quote not clipped or out of context                               | no                                  | yes             |
| Translation faithful                                              | no                                  | yes             |
| Minimum tier and independent count per claim type                 | yes, if tier and wire are filled in | tier assignment |
| No Wikipedia / fact-check alone; no archive.today                 | yes                                 |                 |
| Dates in order (said <= published <= accessed)                    | yes                                 |                 |
| Numbers attributed                                                | heuristic warning                   | yes             |
| Neutral voice                                                     | no                                  | yes             |
| Corrections logged for changed published text                     | yes (CI diff)                       | wording         |
| Party symmetry                                                    | report                              | judgement       |

## 5. Open questions for the owner

1. **Snapshots in the repo.** Can Priors store the extracted text of sources (for quote matching and
   hashes)? Copyright sits with publishers, and the Lok Sabha states its debates are its copyright.
   [P5] Option: store only the excerpt and a hash, and keep full text in a private cache.
2. **Second reader.** Who is the second reviewer for quotes of named living people? Without one, the
   `verified` status is not reachable.
3. **Perma.cc.** Pay for Perma.cc for T1 records, or rely on the Wayback Machine only?
4. **Single-source statements.** 129 of 153 statements have one source. Hide them until they reach
   the minimum, or show them with a "single source" label?
5. **Existing quoted fragments.** Back-fill and match all of them, or convert unmatched ones to
   paraphrase in one pass?
6. **Right of reply.** Which address and which response time? Does Priors offer a named person a
   chance to respond before publishing (PCI norm 34)?
7. **Wire attribution in text.** Should the UI name the wire ("PTI via The Tribune") on every source?
8. **Legal review.** Should a lawyer review the corrections policy and the reply process before
   launch? The notes in 2.10 are research, not legal advice.

### Gaps in this research

- Not opened: AllSides methodology, AP Stylebook quotations entry (paywalled), Ballotpedia policy
  pages, eparlib pages, PTI market share, official text of the First Amendment Act on a government site,
  the Ars Technica report on archive.today, any ANI reply to EU DisinfoLab.
- No published method found for automatic quote matching; recommendation 4.5 is design.
- Current status of the Bombay High Court stay on IT Rules 9(1) and 9(3) not confirmed.
- Exact IPC sections in the Zubair FIRs differ between reports; check a court record before use.
- Items marked † were read through a summarising fetch tool.

## 6. Sources

Wikipedia

- [W1] https://en.wikipedia.org/wiki/Wikipedia:Verifiability
- [W2] https://en.wikipedia.org/wiki/Wikipedia:Reliable_sources
- [W3] https://en.wikipedia.org/wiki/Wikipedia:No_original_research
- [W4] https://en.wikipedia.org/wiki/Wikipedia:Biographies_of_living_persons
- [W5] https://en.wikipedia.org/wiki/Wikipedia:Citation_needed
- [W6] https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style#Quotations
- [W7] https://en.wikipedia.org/wiki/Wikipedia:Citing_sources
- [W8] https://en.wikipedia.org/wiki/Wikipedia:Independent_sources
- [W9] https://en.wikipedia.org/wiki/Wikipedia:Link_rot
- [W10] https://en.wikipedia.org/wiki/Wikipedia:Reliable_sources/Perennial_sources
- https://en.wikipedia.org/wiki/Template:Failed_verification
- https://en.wikipedia.org/wiki/Template:Citation_needed
- https://en.wikipedia.org/wiki/Wikipedia:Verifiability,_not_truth
- https://xkcd.com/978/

Archiving and link rot

- [A1] https://docs.google.com/document/d/1Nsv52MvSjbLb2PCpHlat0gkzw0EvtSgpKHu4mk0MnrA
- [A3] https://en.wikipedia.org/wiki/Wikipedia:Requests_for_comment/Archive.is_RFC_5
- [A4] https://en.wikipedia.org/wiki/Wikipedia:Archive.today_guidance
- [A5] https://web.archive.org/web/20260221155023/https://www.pcmag.com/news/wikipedia-blacklists-archiveis-after-alleged-ddos-attack-on-blogger
- [A6] https://blog.archive.org/2018/10/01/more-than-9-million-broken-links-on-wikipedia-are-now-rescued/
- [A7] https://web.archive.org/web/20261007032659/https://perma.cc/about
- [A8] https://hls.harvard.edu/bibliography/perma-scoping-and-addressing-the-problem-of-link-and-reference-rot-in-legal-citations
- [A8] https://ia800100.us.archive.org/16/items/permascopingandaddressingtheproblemoflinkandreferencerotinlegaldocuments/SSRN-id2329161.pdf
- [A9] https://www.pewresearch.org/data-labs/2024/05/17/when-online-content-disappears/
- [A10] https://web.archive.org/web/20250830061035/https://robustlinks.mementoweb.org/spec/
- [A10] https://web.archive.org/web/20250827115635/https://robustlinks.mementoweb.org/about/
- https://www.rfc-editor.org/rfc/rfc7089.txt
- [A11] https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0167475
- [A12] https://web.archive.org/web/20250115224220/https://newsdiffs.org/about/
- [A13] https://raw.githubusercontent.com/DocNow/diffengine/master/README.md
- [A14] https://arxiv.org/abs/2104.09647

Fact-checkers

- [F1] https://ifcncodeofprinciples.poynter.org/the-commitments
- [F2] https://ifcncodeofprinciples.poynter.org/application-process
- https://ifcncodeofprinciples.poynter.org/complaints-policy
- [F3] https://ifcn-cop-prod-server-8q9x7.ondigitalocean.app/api/organization/signatories
- https://www.altnews.in/jagran-owned-vishvas-news-continues-as-ifcn-signatory-despite-violating-codes-of-conduct/
- [F4] https://www.politifact.com/article/2018/feb/12/principles-truth-o-meter-politifacts-methodology-i/
- [F5] https://fullfact.org/how-we-fact-check/
- [F6] https://fullfact.org/about/feedback/
- [F7] https://fullfact.org/about/corrections/
- [F8] https://fullfact.org/ai/
- [F9] https://www.altnews.in/methodology/
- [F10] https://www.altnews.in/correction-policy
- [F11] https://www.boomlive.in/methodology
- https://www.boomlive.in/correction-policy
- [F12] https://factly.in/factchecking-methodology/
- [F13] https://newschecker.in/our-methodology
- https://newschecker.in/corrections-and-complaints
- [F15] https://www.vishvasnews.com/correction-policy/
- [F16] https://www.thequint.com/amp/story/news/webqoof/mallikarjun-kharge-speech-rahul-gandhi-sacrificed-life-viral-video-fact-check
- [F17] https://api.openalex.org/works/doi:10.1177/2053168018786848 (Lim 2018, abstract)
- https://api.openalex.org/works/doi:10.1515/for-2015-0040 (Marietta et al. 2015, abstract)
- [F18] https://misinforeview.hks.harvard.edu/article/fact-checking-fact-checkers-a-data-driven-approach/
- https://api.openalex.org/works/doi:10.1177/1478929918786852 (Nieminen and Rapeli 2018, abstract)
- [F19] https://www.aljazeera.com/news/2022/6/27/india-journalist-mohammed-zubair-arrested-for-2018-twitter-post
- [F20] https://www.scconline.com/blog/post/2022/07/20/mohammed-zubair-gets-bail-in-all-firs-all-cases-transferred-to-delhi-supreme-court-legal-research-updates-news
- [F21] https://scroll.in/latest/1028654/scroll_in

Corrections and quote handling

- [C1] https://uploads.guim.co.uk/2026/03/03/Editorial_Code_of_Practice_Guidelines_March2026.pdf
- https://www.theguardian.com/theguardian/series/correctionsandclarifications
- https://www.nytimes.com/editorial-standards/ethical-journalism.html
- https://en.wikipedia.org/wiki/Help:Page_history
- [Q1] https://www.reutersagency.com/en/about/standards-values/
- [Q2] https://www.ap.org/about/news-values-and-principles/telling-the-story/quotations/
- [Q3] https://www.theguardian.com/guardian-observer-style-guide-q

Event and incident databases

- [D1] https://acleddata.com/knowledge-base/codebook/
- [D2] https://acleddata.com/knowledge-base/faqs-acled-fatality-methodology/
- [D3] https://acleddata.com/methodology/how-does-acled-code-and-review-data-ensure-quality
- [D4] https://arxiv.org/pdf/2506.00980
- [D5] https://alnap.org/help-library/resources/in-data-we-trust-a-comparison-of-ucdp-ged-and-acled-conflict-events-datasets/
- [D6] https://internetshutdowns.in/about/
- [D7] https://sflc.in/rti-responses-provide-copies-of-internet-shutdown-orders/
- [D8] https://internetshutdowns.in/
- [D9] https://www.accessnow.org/keepiton-data-methodology
- [D10] https://sedition.article-14.com/page/faq
- [D11] https://theleaflet.in/analysis/new-database-quantifies-the-abuse-of-sedition-law-in-india-between-2010-and-2021
- [D12] https://lawschoolpolicyreview.com/2024/09/01/mapping-authoritarian-legality-using-data-in-conversation-with-lubhyathi-rangarajan/
- [D13] https://mappingpoliceviolence.org/files/MappingPoliceViolence_Methodology.pdf
- [D14] https://raw.githubusercontent.com/washingtonpost/data-police-shootings/master/README.md
- [D15] https://web.archive.org/web/20170101023231/https://www.theguardian.com/us-news/ng-interactive/2015/jun/01/about-the-counted
- [D16] https://www.theguardian.com/membership/2016/apr/11/inside-the-counted-guardian-us-police-killings
- https://www.theguardian.com/us-news/series/counted-us-police-killings
- [D17] https://bjs.ojp.gov/content/pub/pdf/ardppsrsm.pdf
- [D18] https://www.newslaundry.com/2019/09/12/factchecker-shuts-down-hate-crime-watch-samar-halarnkars-stint-with-india-spend-ends
- [D19] https://scroll.in/latest/937076/scroll_in
- https://www.aljazeera.com/news/2024/1/31/hate-crime-tracker-hindutva-watch-blocked-in-india-ahead-of-national-vote
- [D20] https://people.cs.vt.edu/~naren/papers/1502.full.pdf

Records of what politicians said

- [P1] https://www.mysociety.org/democracy/theyworkforyou/
- [P2] https://web.archive.org/web/20250211093217/https://www.theyworkforyou.com/help/
- https://parser.theyworkforyou.com/
- [P3] https://rollcall.com/factbase/trump/transcript/donald-trump-interview-fox-and-friends-august-17-2020/
- [P4] https://prsindia.org/billtrack/the-citizenship-amendment-bill-2019
- [P5] https://sansad.in/ls/debates/introduction
- [P6] https://sansad.in/uploads/Disclaimer_RSD_FV_ENGLISH_6720645cc7.pdf
- [P7] https://pib.gov.in/PressReleasePage.aspx?PRID=2100000
- [P8] https://www.sfpublicpress.org/ballotpedia-strives-to-earn-voters-trust-with-comprehensive-elections-guide/

Open-source investigation

- [O1] https://www.ohchr.org/sites/default/files/2024-01/OHCHR_BerkeleyProtocol.pdf
- [O2] https://www.bellingcat.com/resources/2022/09/22/preserve-vital-online-content-with-bellingcats-auto-archiver-tool/
- [O3] https://www.bellingcat.com/resources/2025/08/13/the-open-source-tool-that-has-preserved-150000-pieces-of-online-evidence/
- [O4] https://www.bellingcat.com/news/2022/03/17/hospitals-bombed-and-apartments-destroyed-mapping-incidents-of-civilian-harm-in-ukraine/
- https://reutersinstitute.politics.ox.ac.uk/news/how-bellingcat-collects-verifies-and-archives-digital-evidence-war-crimes-ukraine

LLM citation accuracy

- [M1] https://www.nhd.uscourts.gov/sites/default/files/pdf/Mata-v-Avianca-sanctions-order.PDF
- [M2] https://www.livelawbiz.com/high-court/bombay-high-court/dont-blindly-trust-ai-bombay-hc-quashes-income-tax-assessment-passed-on-unverified-ai-generated-case-laws-307866
- https://lawbeat.in/news-updates/delhi-high-court-allows-withdrawal-of-plea-citing-non-existent-judgments-and-ai-generated-content-1532103
- https://www.verdictum.in/court-updates/high-courts/andhra-pradesh-high-court/gummadi-usha-rani-v-sure-mallikarjuna-rao-civil-revision-petition-no-2487-of-2025-artificial-intelligence-trial-court-fake-citation-1605575
- [M3] https://www.scconline.com/blog/post/2026/03/11/sc-raises-concern-use-ai-generated-fake-precedents/
- [M4] https://arxiv.org/abs/2304.09848
- [M5] https://www.cjr.org/tow_center/we-compared-eight-ai-search-engines-theyre-all-bad-at-citing-news.php
- [M6] https://arxiv.org/abs/2305.14627
- [M7] https://platform.claude.com/docs/en/build-with-claude/citations
- [M8] https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool

Source ranking

- [R1] https://pmc.ncbi.nlm.nih.gov/articles/PMC10500312/
- [R2] https://www.mediapost.com/publications/article/414415/ftc-withdraws-demand-for-information-from-newsguar.html
- https://www.newsguardtech.com/ratings/rating-process-criteria/
- [R3] https://www.poynter.org/fact-checking/media-literacy/2021/should-you-trust-media-bias-charts/
- [R4] https://www.newslaundry.com/2021/05/18/how-press-releases-published-by-ani-make-their-way-to-news-portals-as-news
- [R5] https://www.newslaundry.com/shorts/ani-pulls-down-erroneous-story-on-11-bajrang-dal-activists-being-arrested
- [R6] https://m.thewire.in/article/media/dcp-noida-refutes-ani-report-linking-quarantine-setup-in-noida-with-tablighi-jamaat/amp
- https://www.disinfo.eu/publications/indian-chronicles-deep-dive-into-a-15-year-operation-targeting-the-eu-and-un-to-serve-indian-interests/
- https://www.aljazeera.com/news/2020/12/11/eu-ngo-report-uncovers-a-15-year-disinformation-campaign
- [R7] https://www.bbc.com/editorialguidelines/guidelines/accuracy/guidelines
- [R8] https://fullfact.org/culture-and-society/how-do-you-count-crowds/
- [R9] https://www.npr.org/sections/publiceditor/2017/01/27/512034702/mailbag-for-two-marches-different-causes-different-complaints
- https://www.cjr.org/united_states_project/estimating_crowds_size_matters.php
- https://www.koreatimes.co.kr/southkorea/20161107/why-police-rally-organizers-count-protesters-differently
- [R10] https://adfontesmedia.com/how-ad-fontes-ranks-news-sources/

Indian law and press practice

- [L1] https://www.mha.gov.in/sites/default/files/250883_english_01042024.pdf
- https://devgan.in/bns/section/356/
- [L2] https://www.scobserver.in/court-case/defamation-as-a-criminal-offence
- https://blog.ipleaders.in/how-to-file-a-defamation-case-in-india/
- [L4] https://pib.gov.in/PressReleasePage.aspx?PRID=1700766
- [L5] https://theleaflet.in/bombay-hc-stays-parts-of-new-it-rules-on-plea-by-the-leaflet-says-rules-prima-facie-violate-freedom-of-speech-and-expression
- [L7] https://livelaw.in/top-stories/bombay-high-court-fact-check-unit-it-rules-kunal-kamra-270722
- [L8] https://globalfreedomofexpression.columbia.edu/cases/kunal-kamra-v-union-of-india/
- [L9] https://static.pib.gov.in/WriteReadData/specificdocs/documents/2022/nov/doc20221117126801.pdf
- [L10] https://www.thehindu.com/readers-editor-terms/
- [L11] https://scroll.in/article/902616/the-readers-editor-writes-scroll-in-readers-must-take-ownership-of-the-office-that-reports-to-them
- https://m.thewire.in/article/media/the-wire-editorial-to-our-readers-an-apology-and-a-promise/amp
- [L12] https://indiankanoon.org/doc/110813550/ (Shreya Singhal v UOI, 2015)
- [L13] https://indiankanoon.org/doc/1218090/ (Article 19)
- [L14] https://www.livelaw.in/amp/high-court/delhi-high-court/delhi-high-court-ani-wikipedia-defamation-262700
- [L15] https://www.livelaw.in/amp/high-court/delhi-high-court/delhi-high-court-ani-wikipedia-defamation-291701
- [L16] https://indiankanoon.org/doc/17021567/ (Ramlila Maidan Incident, 2012)
- [L17] https://indiankanoon.org/doc/82461587/ (Anuradha Bhasin v UOI, 2020)
- [L18] https://internetfreedom.in/rti-responses-from-andhra-pradesh-and-gujarat-show-compliance-failure-with-the-anuradha-bhasin-internet-shutdown-decision/
- [L19] https://theleaflet.in/digital-rights/union-government-reiterates-that-it-does-not-need-to-maintain-records-of-internet-shutdowns-in-the-country
- https://internetfreedom.in/standing-committee-action-taken-report/
- [L20] https://www.legitquest.com/act/telecommunications-temporary-suspension-of-services-rules-2024/10753
- https://internetfreedom.in/first-read-telecom-suspension-rules-2024/
- [L21] https://sflc.in/telecom-suspension-rules-2024/
- [L22] https://internetshutdowns.in/
- https://globalfreedomofexpression.columbia.edu/cases/software-freedom-law-center-india-v-state-of-jharkhand/
- [L23] https://www.constitution.org/cons/india/tamnd1.htm (First Amendment Act, 1951; non-government mirror)
- [L24] https://indiankanoon.org/doc/456839/ (Romesh Thappar v State of Madras, 1950)
- [L25] https://indiankanoon.org/doc/80616728/ (Mazdoor Kisan Shakti Sangathan v UOI, 2018)

import { z } from "zod";
import { canonicalParty } from "./parties";

export const ACTION_TYPES = [
  "permission_denied",
  "permission_granted",
  "section_144",
  "curfew",
  "internet_shutdown",
  "detention",
  "preventive_arrest",
  "fir",
  "sedition_charge",
  "uapa_charge",
  "nsa_detention",
  "lathi_charge",
  "tear_gas",
  "firing",
  "barricading",
  "negotiation",
  "concession",
  "repeal",
  "censorship",
  "surveillance",
  "property_demolition",
  "house_arrest",
  "deportation",
  "commission_of_inquiry",
  "other",
] as const;

export type ActionType = (typeof ACTION_TYPES)[number];

/** Human labels and a coarse group used for colour and ordering. */
export const ACTION_META: Record<
  ActionType,
  { label: string; group: "restrict" | "force" | "legal" | "engage" | "other" }
> = {
  permission_denied: { label: "Permission denied", group: "restrict" },
  permission_granted: { label: "Permission granted", group: "engage" },
  section_144: { label: "Section 144 / 163", group: "restrict" },
  curfew: { label: "Curfew", group: "restrict" },
  internet_shutdown: { label: "Internet shutdown", group: "restrict" },
  censorship: { label: "Censorship", group: "restrict" },
  surveillance: { label: "Surveillance", group: "restrict" },
  barricading: { label: "Barricading", group: "restrict" },
  detention: { label: "Detention", group: "legal" },
  preventive_arrest: { label: "Preventive arrest", group: "legal" },
  house_arrest: { label: "House arrest", group: "legal" },
  fir: { label: "FIR", group: "legal" },
  sedition_charge: { label: "Sedition charge", group: "legal" },
  uapa_charge: { label: "UAPA charge", group: "legal" },
  nsa_detention: { label: "NSA detention", group: "legal" },
  deportation: { label: "Deportation", group: "legal" },
  property_demolition: { label: "Property demolition", group: "force" },
  lathi_charge: { label: "Lathi charge", group: "force" },
  tear_gas: { label: "Tear gas", group: "force" },
  firing: { label: "Firing", group: "force" },
  negotiation: { label: "Negotiation", group: "engage" },
  concession: { label: "Concession", group: "engage" },
  repeal: { label: "Repeal", group: "engage" },
  commission_of_inquiry: { label: "Commission of inquiry", group: "engage" },
  other: { label: "Other", group: "other" },
};

const DateStr = z.union([z.string(), z.date(), z.number()]).transform((v) => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
});

/** Optional string that also accepts null (YAML authors write `person:` with nothing after it). */
const OptStr = z
  .string()
  .nullish()
  .transform((v) => v ?? undefined);

/**
 * Evidence tiers, rated by the kind of evidence, never by the outlet. See docs/proposal-phase1-rules.html.
 * record T1, court T2, recording T3, report T4, secondary T5, lead T6 (never enough alone).
 */
export const TIERS = ["record", "court", "recording", "report", "secondary", "lead"] as const;
export type Tier = (typeof TIERS)[number];
export const TIER_META: Record<Tier, { rank: number; label: string; help: string }> = {
  record: { rank: 1, label: "Record", help: "The order, gazette, FIR, debate or the speaker's own words" },
  court: { rank: 2, label: "Court", help: "A judgment, court order, affidavit or inquiry report" },
  recording: { rank: 3, label: "Recording", help: "A full recording or verbatim transcript" },
  report: { rank: 4, label: "Report", help: "Contemporaneous reporting by a named reporter" },
  secondary: { rank: 5, label: "Secondary", help: "Wire copy, unnamed byline, analysis or an NGO report" },
  lead: { rank: 6, label: "Lead", help: "Wikipedia, a fact-check or an aggregator. Never enough alone" },
};

export const WIRES = ["PTI", "ANI", "UNI", "IANS", "Reuters", "AFP", "AP"] as const;
export type Wire = (typeof WIRES)[number];

/** archive.today and its mirrors. Not allowed as an archive: its operators altered archived pages. */
export const BANNED_ARCHIVE_HOSTS = [
  "archive.today",
  "archive.ph",
  "archive.is",
  "archive.li",
  "archive.vn",
  "archive.md",
  "archive.fo",
];

const Source = z.object({
  id: z.string(),
  title: z.string(),
  publisher: OptStr.transform((v) => v ?? ""),
  url: z.string(),
  date: DateStr.nullish().transform((v) => v ?? undefined),
  type: z.enum(["news", "court_judgment", "official", "academic", "book", "archive"]).optional().default("news"),
  tier: z.enum(TIERS).optional(),
  /** The wire service whose copy this is. All copies of one wire story count as one source. */
  wire: z.enum(WIRES).optional(),
  /** Named reporter or author. A news report with no named reporter is secondary, not report. */
  author: OptStr,
  /** ISO 639-1 code of the source text. */
  language: z.string().optional().default("en"),
  /** Wayback Machine snapshot. */
  archive_url: OptStr,
  archive_date: DateStr.nullish().transform((v) => v ?? undefined),
  /** When a person or the pipeline last opened the source. */
  accessed: DateStr.nullish().transform((v) => v ?? undefined),
});

const Government = z.object({
  party: z.string().transform(canonicalParty),
  alliance: OptStr,
  head: OptStr,
  role: OptStr,
  name: OptStr,
});

/** What kind of fact a claim is. Each kind has its own minimum evidence. */
export const CLAIMS = ["ordered", "happened", "held"] as const;
export type Claim = (typeof CLAIMS)[number];

const Figure = z.object({
  what: z.string(),
  value: z.string(),
  claimed_by: z.string(),
  source: z.string(),
});

const CourtOutcome = z.object({
  summary: z.string(),
  source: z.string(),
});

const Action = z.object({
  type: z.enum(ACTION_TYPES),
  date: DateStr.nullish().transform((v) => v ?? undefined),
  description: z.string(),
  actor: z.enum(["centre", "state", "police", "court", "other"]).optional().default("state"),
  /**
   * Where a state, police or other action took place: one state or Union Territory, or several when
   * one action spans them. Names as in content/governments. Decides which government it counts for.
   */
  state: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (v === undefined ? [] : Array.isArray(v) ? v : [v])),
  sources: z.array(z.string()).optional().default([]),
  /** Overrides the claim kind inferred from type and actor. */
  claim: z.enum(CLAIMS).optional(),
  /** The law the state invoked, as named in the order where possible. */
  legal_basis: OptStr,
  court_outcomes: z.array(CourtOutcome).optional().default([]),
  /** Disputed numbers, each with who gave it. */
  figures: z.array(Figure).optional().default([]),
});

export const STATEMENT_KINDS = ["verbatim", "translated", "paraphrase"] as const;
export type StatementKind = (typeof STATEMENT_KINDS)[number];

const Quote = z.object({
  /** The exact words as published, in English. */
  text: z.string(),
  /** Required for translated quotes: the words in the original language. */
  original: OptStr,
  language: OptStr,
  /** Who translated: the source itself, or Priors. Machine translation is not allowed. */
  translated_by: z.enum(["source", "priors"]).optional(),
  /** Timestamp, paragraph or page where the words appear. */
  locator: OptStr,
  source: z.string(),
});

const Position = z.object({
  party: z.string().transform(canonicalParty),
  person: OptStr,
  role_at_time: OptStr,
  in_power: z.boolean(),
  date: DateStr.nullish().transform((v) => v ?? undefined),
  statement: z.string(),
  sources: z.array(z.string()).optional().default([]),
  /** verbatim and translated statements carry a quote. Only quote text goes in quote marks. */
  kind: z.enum(STATEMENT_KINDS).optional(),
  quote: Quote.optional(),
});

const Correction = z.object({
  date: DateStr,
  kind: z.enum(["correction", "clarification", "update"]),
  note: z.string(),
});

const Review = z.object({
  status: z.enum(["draft", "checked", "verified"]),
  by: OptStr,
  date: DateStr.nullish().transform((v) => v ?? undefined),
});

export const Precedent = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  period: z.object({ start: DateStr, end: DateStr.nullable().optional() }),
  location: z
    .object({
      states: z
        .array(z.string())
        .nullish()
        .transform((v) => v ?? []),
      places: z
        .array(z.string())
        .nullish()
        .transform((v) => v ?? []),
    })
    .nullish()
    .transform((v) => v ?? { states: [], places: [] }),
  protest: z
    .object({
      cause: OptStr,
      organisers: z
        .array(z.string())
        .nullish()
        .transform((v) => v ?? []),
      scale: OptStr,
    })
    .nullish()
    .transform((v) => v ?? { cause: undefined, organisers: [], scale: undefined }),
  government: z.object({
    centre: Government,
    state: Government.optional(),
  }),
  actions: z.array(Action),
  outcome: OptStr.transform((v) => v ?? ""),
  positions: z.array(Position).optional().default([]),
  sources: z.array(Source),
  tags: z.array(z.string()).optional().default([]),
  // current-event only
  related_precedents: z.array(z.string()).optional().default([]),
  generated_by: z.string().optional(),
  reviewed: z.boolean().optional(),
  review: Review.optional(),
  corrections: z.array(Correction).optional().default([]),
  last_updated: DateStr.optional(),
});

export type Precedent = z.infer<typeof Precedent>;

/**
 * Who governed, by date (content/governments/*.yaml): one file for the Centre, one per state or
 * Union Territory. A term is a head of government and their party, President's Rule, or
 * administration by the Centre (a Union Territory without its own government).
 */
const Term = z.object({
  from: DateStr,
  /** Last day in office. Omit for the term in office now. */
  to: DateStr.nullish().transform((v) => v ?? undefined),
  head: z.string(),
  /** Party of the head of government. Omit for President's Rule and Centre administration. */
  party: OptStr.transform((v) => v && canonicalParty(v)),
  alliance: OptStr,
  /** "elected": a Chief Minister or Prime Minister. "presidents_rule" and "centre" count for the Centre. */
  kind: z.enum(["elected", "presidents_rule", "centre"]).optional().default("elected"),
  sources: z.array(z.string()).min(1),
});

export const GovernmentFile = z.object({
  /** "Centre", or the state or Union Territory name used in an action's `state` field. */
  name: z.string(),
  /** Earlier names, such as Orissa for Odisha. Actions may use either. */
  aliases: z.array(z.string()).optional().default([]),
  /** Who controls the police, when not the state government (Delhi Police reports to the Union Home Ministry). */
  police: z.enum(["state", "centre"]).optional().default("state"),
  police_note: OptStr,
  terms: z.array(Term),
  sources: z.array(Source),
});
export type GovernmentFile = z.infer<typeof GovernmentFile>;
export type Term = z.infer<typeof Term>;
export type Action = z.infer<typeof Action>;
export type Position = z.infer<typeof Position>;
export type Source = z.infer<typeof Source>;
export type Quote = z.infer<typeof Quote>;
export type Figure = z.infer<typeof Figure>;
export type Correction = z.infer<typeof Correction>;

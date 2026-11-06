/**
 * The review lifecycle rule enforced on pull requests (check-corrections.ts).
 *
 *   draft < checked < verified
 *
 * - A checked or verified entry that changes what it claims must add a
 *   corrections item.
 * - Lowering the review status is a change of what the site vouches for, so
 *   it needs a corrections item too. Without this, one pull request could
 *   downgrade an entry to draft and the next could rewrite it freely.
 *
 * STATE_MACHINES audit 2026-11-06, defect 4.1b.
 */
import type { Precedent } from "../src/lib/schema";

const RANK = { draft: 0, checked: 1, verified: 2 } as const;
type Status = keyof typeof RANK;

export function reviewStatus(p: Precedent): Status {
  return p.review?.status ?? (p.reviewed ? "checked" : "draft");
}

/** The parts of an entry a reader relies on. */
export function claims(p: Precedent): string {
  return JSON.stringify({
    summary: p.summary,
    outcome: p.outcome,
    actions: p.actions.map((a) => [a.type, a.date, a.description, a.figures, a.legal_basis]),
    positions: p.positions.map((x) => [x.person, x.date, x.statement, x.quote?.text, x.quote?.original]),
  });
}

/** Returns why the change fails, or null when it is allowed. */
export function correctionsProblem(before: Precedent, after: Precedent): string | null {
  const was = reviewStatus(before);
  if (was === "draft") return null;
  const addedCorrection = after.corrections.length > before.corrections.length;
  if (addedCorrection) return null;
  const now = reviewStatus(after);
  if (RANK[now] < RANK[was]) return `review status lowered from ${was} to ${now} without a corrections item`;
  if (claims(before) !== claims(after)) return `a ${was} entry changed what it claims without a corrections item`;
  return null;
}

import { ACTION_META, type ActionType } from "@/lib/schema";

export type Group = (typeof ACTION_META)[ActionType]["group"];

export const GROUPS: { group: Group; label: string }[] = [
  { group: "restrict", label: "Restrict" },
  { group: "legal", label: "Legal action" },
  { group: "force", label: "Force" },
  { group: "engage", label: "Engage" },
  { group: "other", label: "Other" },
];

/** Hollow shapes, one per action group. Same ink, same size: no group looks more alarming than another. */
const SHAPE: Record<Group, React.ReactNode> = {
  restrict: <rect x="2.5" y="2.5" width="11" height="11" />,
  legal: <path d="M8 1.8 14.2 8 8 14.2 1.8 8Z" />,
  force: <path d="M8 2.2 14.2 13.5H1.8Z" strokeLinejoin="round" />,
  engage: <circle cx="8" cy="8" r="5.8" />,
  other: <path d="M2.5 8h11" />,
};

export default function Glyph({ group, className = "" }: { group: Group; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`glyph ${className}`} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      {SHAPE[group]}
    </svg>
  );
}

export function groupOf(t: ActionType): Group {
  return ACTION_META[t].group;
}

/** The groups, in legend order, that appear in a list of action types. */
export function groupsIn(types: ActionType[]): Group[] {
  const present = new Set(types.map(groupOf));
  return GROUPS.map((g) => g.group).filter((g) => present.has(g));
}

export function GlyphLegend({ className = "" }: { className?: string }) {
  return (
    <p className={`chips ${className}`}>
      {GROUPS.map(({ group, label }) => (
        <span key={group} className="chip">
          <Glyph group={group} />
          {label}
        </span>
      ))}
    </p>
  );
}

/** Glyph-only summary of a precedent's actions, one glyph per group. */
export function GroupGlyphs({ types, highlight }: { types: ActionType[]; highlight?: ActionType[] }) {
  const groups = groupsIn(types);
  const lit = highlight ? new Set(highlight.map(groupOf)) : null;
  const label = groups.map((g) => GROUPS.find((x) => x.group === g)!.label).join(", ");
  return (
    <span className="inline-flex gap-2 text-ink-2" role="img" aria-label={label}>
      {groups.map((g) => (
        <Glyph key={g} group={g} className={lit && !lit.has(g) ? "dim" : ""} />
      ))}
    </span>
  );
}

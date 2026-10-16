import Link from "next/link";
import { fmtDate, years } from "@/lib/format";
import { ACTION_META, ACTION_TYPES, type ActionType, type Precedent } from "@/lib/schema";
import { claimOf } from "@/lib/evidence";
import { entryParties, whereLine } from "@/lib/content";
import { EvidenceMark } from "./Evidence";

type Col = { p: Precedent; href?: string; now?: boolean };

/** Who acted, by party: see whereLine. */
function govtLine(p: Precedent) {
  return whereLine(p);
}

function label(c: Col) {
  return c.now ? "Now" : years(c.p.period.start, c.p.period.end);
}

/** Phones: the column heads only fit a start year. */
/** Phones: the party with the most actions, and how many others. */
function shortParties(p: Precedent) {
  const ps = entryParties(p);
  return ps.length > 1 ? `${ps[0]} +${ps.length - 1}` : (ps[0] ?? "");
}

function shortLabel(c: Col) {
  return c.now ? "Now" : c.p.period.start.slice(0, 4);
}

/** Count cell: the number of recorded actions, or a dash when none is recorded. */
function Count({ n }: { n: number }) {
  return n ? (
    <span className="sbs-n" aria-label={`${n} recorded`}>
      {n}
    </span>
  ) : (
    <span className="sbs-none" aria-label="None recorded">
      –
    </span>
  );
}

/**
 * The current event and its closest precedents as columns, with one row per action type.
 * A row shows counts; tap it to read what each government did. On wide screens the
 * detail lines up under its column. On phones it stacks, each line labelled with its column.
 */
export default function SideBySide({ cols }: { cols: Col[] }) {
  const order = (t: ActionType) => ACTION_TYPES.indexOf(t);
  const hits = (c: Col, t: ActionType) => c.p.actions.filter((a) => a.type === t);
  const all = [...new Set(cols.flatMap((c) => c.p.actions.map((a) => a.type)))].sort((a, b) => order(a) - order(b));
  const now = cols.find((c) => c.now);
  const shared = all.filter((t) => now && hits(now, t).length);
  const rest = all.filter((t) => !shared.includes(t));
  const style = { "--sbs-cols": cols.length } as React.CSSProperties;

  const Row = ({ t }: { t: ActionType }) => (
    <details className="sbs-row">
      <summary className="sbs-grid">
        <span className="sbs-label">
          <span>{ACTION_META[t].label}</span>
        </span>
        {cols.map((c) => (
          <span key={c.p.id} className="sbs-cell">
            <Count n={hits(c, t).length} />
          </span>
        ))}
      </summary>
      <div className="sbs-detail">
        <span className="max-sm:hidden" />
        {cols.map((c) => {
          const hs = hits(c, t);
          return (
            <div key={c.p.id} className={`sbs-entry ${hs.length ? "" : "max-sm:hidden"}`}>
              <p className="sbs-entry-head sm:hidden">{shortLabel(c)}</p>
              {hs.length ? (
                hs.map((h, i) => (
                  <p key={i} className="text-[14px] text-ink-2 leading-snug [&+&]:mt-2">
                    {h.date && <span className="num text-ink-3">{fmtDate(h.date)}. </span>}
                    {h.description}{" "}
                    <EvidenceMark claim={claimOf(h)} sources={c.p.sources.filter((x) => h.sources.includes(x.id))} />
                  </p>
                ))
              ) : (
                <p className="text-[14px] text-ink-3">None recorded</p>
              )}
            </div>
          );
        })}
      </div>
    </details>
  );

  return (
    <div className="sbs" style={style}>
      {/* Phones: a key, because the column heads only fit a year. */}
      <ol className="sm:hidden mb-6 space-y-2.5">
        {cols.map((c) => (
          <li key={c.p.id} className="grid grid-cols-[3.25rem_1fr] gap-2 text-[15px] leading-snug">
            <span className="num font-semibold">{shortLabel(c)}</span>
            <span>
              {c.href ? (
                <Link href={c.href} className="quiet">
                  {c.p.title}
                </Link>
              ) : (
                c.p.title
              )}
              <span className="block small clamp clamp-2">{govtLine(c.p)}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="sbs-head sbs-grid">
        <span className="small">
          <span className="max-sm:hidden">Action</span>
        </span>
        {cols.map((c) => (
          <span key={c.p.id} className="sbs-col">
            <span className="num font-semibold text-ink">
              <span className="sm:hidden">{shortLabel(c)}</span>
              <span className="max-sm:hidden">{label(c)}</span>
            </span>
            <span className="max-sm:hidden">
              <span className="block mt-0.5 clamp clamp-2 text-ink text-[14px] leading-snug">
                {c.href ? (
                  <Link href={c.href} className="quiet">
                    {c.p.title}
                  </Link>
                ) : (
                  c.p.title
                )}
              </span>
            </span>
            <span className="block small mt-0.5 max-sm:text-[11px]">
              <span className="max-sm:hidden">{govtLine(c.p)}</span>
              <span className="sm:hidden">{shortParties(c.p)}</span>
            </span>
          </span>
        ))}
      </div>

      <div className="rows">
        {shared.map((t) => (
          <Row key={t} t={t} />
        ))}
      </div>
      {rest.length > 0 && (
        <>
          <p className="small pt-6 pb-2 border-t border-line">Not recorded in the current event</p>
          <div className="rows">
            {rest.map((t) => (
              <Row key={t} t={t} />
            ))}
          </div>
        </>
      )}

      <details className="sbs-row border-t border-line">
        <summary className="sbs-grid">
          <span className="sbs-label">
            <span className="font-semibold">Outcome</span>
          </span>
          {cols.map((c) => (
            <span key={c.p.id} className="sbs-cell" />
          ))}
        </summary>
        <div className="sbs-detail">
          <span className="max-sm:hidden" />
          {cols.map((c) => (
            <div key={c.p.id} className="sbs-entry">
              <p className="sbs-entry-head sm:hidden">{shortLabel(c)}</p>
              <p className="text-[14px] text-ink-2 leading-snug">
                {c.p.outcome || (c.now ? "Ongoing." : "None recorded")}
              </p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

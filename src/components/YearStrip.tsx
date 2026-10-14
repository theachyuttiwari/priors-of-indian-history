import type { Precedent } from "@/lib/schema";
import { fmtPeriod, siteUpdated } from "@/lib/content";

/** Decimal year from an ISO-ish date string ("2020", "2020-11", "2020-11-26"). */
function decimal(d: string): number {
  const [y, m = "7", day = "15"] = d.split("-");
  return +y + (+m - 1) / 12 + (+day - 1) / 365;
}

/**
 * The whole record on one line, first precedent to now. One tick per precedent.
 * Tick height shows how many kinds of action a precedent shares with the current event.
 * Ticks in the lower third fade.
 * Static HTML positioned by percentage, so it needs no client JS.
 */
export default function YearStrip({ precedents, current }: { precedents: Precedent[]; current?: Precedent }) {
  // The site is refreshed by hand, so the right edge is the last content update, not the build time.
  const asOf = siteUpdated();
  const now = new Date(`${asOf}T00:00:00Z`);
  const nowY = decimal(asOf);
  const from = Math.min(...precedents.map((p) => +p.period.start.slice(0, 4)));
  const to = nowY + 0.2;
  const x = (y: number) => ((y - from) / (to - from)) * 100;
  const evTypes = new Set(current?.actions.map((a) => a.type) ?? []);
  const shared = (p: Precedent) => new Set(p.actions.map((a) => a.type).filter((t) => evTypes.has(t))).size;
  const most = Math.max(1, ...precedents.map(shared));
  const kinds = (n: number) => `${n} ${n === 1 ? "kind" : "kinds"} of action`;
  const firstDecade = Math.ceil((from + 1) / 10) * 10;
  const decades = [from];
  for (let y = firstDecade; y < nowY - 3; y += 10) decades.push(y);
  const nowLabel = now.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

  return (
    <div>
      <div
        className="strip"
        role="group"
        aria-label={`Year strip from ${from} to ${now.getFullYear()}, one tick per precedent`}
      >
        <div className="strip-axis" />
        {decades.map((y, i) => (
          <span
            key={y}
            className={`strip-year num ${i === 0 ? "first" : ""} ${i % 2 === 1 ? "mid" : ""}`}
            style={{ left: `${x(y)}%` }}
          >
            {y}
          </span>
        ))}
        {precedents.map((p) => {
          const pos = x(decimal(p.period.start));
          const k = current ? shared(p) / most : 1;
          const h = Math.round(8 + k * 26);
          const side = pos < 20 ? "l" : pos > 80 ? "r" : "";
          return (
            <a
              key={p.id}
              href={`/precedents/${p.id}/`}
              className={`tick ${k < 1 / 3 ? "faded" : ""} ${side}`}
              style={{ left: `${pos}%`, top: `${74 - h}px`, height: `${h}px` }}
              aria-label={`${p.title}, ${fmtPeriod(p.period)}${current ? `, shares ${kinds(shared(p))} with the current event` : ""}`}
            >
              <i />
              <span className="tip">
                <span className="num">{p.period.start.slice(0, 4)}</span> {p.title}
                {current && <span className="block opacity-70 num">Shares {kinds(shared(p))}</span>}
              </span>
            </a>
          );
        })}
        <span className="strip-now" style={{ left: `${x(nowY)}%` }} />
        <span className="strip-now-label" style={{ left: `calc(${x(nowY)}% + 8px)` }}>
          As of {nowLabel}
        </span>
      </div>
      {current && (
        <p className="small mt-1 measure">
          Taller ticks share more kinds of action with{" "}
          <a href={`/now/${current.id}/`} className="link">
            {current.title}
          </a>
          . Select a tick to open its precedent.
        </p>
      )}
    </div>
  );
}

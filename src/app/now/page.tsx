import Link from "next/link";
import { getCurrent, fmtPeriod, similar } from "@/lib/content";
import ActionChip from "@/components/ActionChip";

export const metadata = { title: "Now" };

export default function NowPage() {
  const current = getCurrent();
  return (
    <div>
      <h1 className="t-1">Now</h1>
      <p className="lede mt-4 measure">
        Protests underway in India and how governments are answering them. Each one is matched to its closest
        precedents.
      </p>
      {current.length === 0 && (
        <p className="mt-10 text-ink-2">No current events yet. Run the pipeline or add a file under content/current.</p>
      )}
      <div className="rows mt-10 border-t border-line">
        {current.map((ev) => {
          const sims = similar(ev, 3);
          const where = ev.government.state
            ? `${ev.government.state.party} in ${ev.government.state.name}, ${ev.government.centre.party} at the Centre`
            : `${ev.government.centre.party} at the Centre`;
          return (
            <article key={ev.id} className="py-8">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h2 className="t-3 text-[24px]">
                  <Link href={`/now/${ev.id}/`} className="quiet">
                    {ev.title}
                  </Link>
                </h2>
                <span className="small num">{fmtPeriod(ev.period)}</span>
              </div>
              <p className="small mt-1">{where}</p>
              <p className="text-ink-2 mt-3 measure">{ev.summary}</p>
              <div className="chips mt-4">
                {[...new Set(ev.actions.map((a) => a.type))].map((t) => (
                  <ActionChip key={t} type={t} />
                ))}
              </div>
              {ev.reviewed === false && (
                <p className="small mt-3">Drafted with AI help. Not yet reviewed by a person.</p>
              )}
              {sims.length > 0 && (
                <p className="text-[15px] text-ink-2 mt-4">
                  Closest precedents:{" "}
                  {sims.map(({ p }, i) => (
                    <span key={p.id}>
                      {i > 0 && ", "}
                      <Link href={`/precedents/${p.id}/`} className="link">
                        {p.title}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

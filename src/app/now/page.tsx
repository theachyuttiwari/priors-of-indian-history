import Link from "next/link";
import { getCurrent, fmtPeriod, similar } from "@/lib/content";
import ActionChip from "@/components/ActionChip";

export const metadata = { title: "Now" };

export default function NowPage() {
  const current = getCurrent();
  return (
    <div>
      <p className="eyebrow">Current events</p>
      <h1 className="display text-4xl mt-2">Now</h1>
      <p className="text-ink-2 mt-3 max-w-2xl">
        Protests underway in India and how governments are answering them, each matched to its closest priors.
      </p>
      {current.length === 0 && (
        <p className="mt-10 text-ink-3">No current events yet. Run the pipeline or add a file under content/current.</p>
      )}
      <ol className="mt-10 space-y-6">
        {current.map((ev) => {
          const sims = similar(ev, 3);
          return (
            <li key={ev.id} className="card p-6">
              <div className="flex items-center justify-between">
                <span className="mono text-xs text-ink-3">{fmtPeriod(ev.period)}</span>
                <span className="text-xs text-ink-3">
                  {ev.government.state ? `${ev.government.state.party} (${ev.government.state.name}) · ` : ""}
                  centre {ev.government.centre.party}
                </span>
              </div>
              <Link href={`/now/${ev.id}/`} className="quiet display text-2xl mt-2 block hover:text-accent">
                {ev.title}
              </Link>
              <p className="text-sm text-ink-2 mt-2 max-w-3xl">{ev.summary}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[...new Set(ev.actions.map((a) => a.type))].map((t) => (
                  <ActionChip key={t} type={t} />
                ))}
              </div>
              {sims.length > 0 && (
                <p className="text-xs text-ink-3 mt-4">
                  Closest priors:{" "}
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
            </li>
          );
        })}
      </ol>
    </div>
  );
}

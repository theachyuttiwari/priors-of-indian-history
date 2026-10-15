import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrent, getCurrentEvent, fmtPeriod, similar, fmtDate, entryUpdated } from "@/lib/content";
import Timeline from "@/components/Timeline";
import Positions from "@/components/Positions";
import Sources from "@/components/Sources";
import SideBySide from "@/components/SideBySide";
import ReviewNote from "@/components/ReviewNote";
import CorrectionsList from "@/components/CorrectionsList";

export function generateStaticParams() {
  const ids = getCurrent().map((p) => ({ id: p.id }));
  // Static export needs at least one path; fall back to a placeholder when there are no current events yet.
  return ids.length ? ids : [{ id: "none" }];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = getCurrentEvent((await params).id);
  if (!p) return { title: "Now" };
  return { title: p.title, description: p.summary, openGraph: { title: p.title, description: p.summary } };
}

export default async function NowEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ev = getCurrentEvent(id);
  if (!ev) {
    if (id === "none") return <p className="text-ink-2">No current events yet.</p>;
    notFound();
  }
  const sims = similar(ev, 3);
  return (
    <article className="space-y-20">
      <header>
        <Link href="/now/" className="link small">
          Now
        </Link>
        <h1 className="t-1 mt-4 max-w-3xl">{ev.title}</h1>
        <p className="small num mt-3">
          {fmtPeriod(ev.period)}
          {entryUpdated(ev) && <>. Last updated {fmtDate(entryUpdated(ev))}</>}
        </p>
        <p className="lede mt-6 measure">{ev.summary}</p>
        <ReviewNote p={ev} className="mt-6" />
      </header>

      <section>
        <h2 className="t-2 mb-2">Side by side</h2>
        <p className="small mb-6 measure">
          This event and the three closest precedents. Each number counts the actions of that kind in our sources. Tap a
          row to read them.
        </p>
        <SideBySide cols={[{ p: ev, now: true }, ...sims.map(({ p }) => ({ p, href: `/precedents/${p.id}/` }))]} />
      </section>

      <section>
        <h2 className="t-2 mb-6">What has happened so far</h2>
        <Timeline p={ev} />
      </section>

      {ev.positions.length > 0 && (
        <section>
          <h2 className="t-2 mb-8">What they are saying</h2>
          <Positions p={ev} />
        </section>
      )}

      <section>
        <h2 className="t-2 mb-6">Sources</h2>
        <Sources p={ev} />
      </section>

      {ev.corrections.length > 0 && (
        <section>
          <h2 className="t-2 mb-6">Corrections and updates</h2>
          <CorrectionsList items={ev.corrections} />
        </section>
      )}
    </article>
  );
}

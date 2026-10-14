import Link from "next/link";
import type { ActionType, Precedent } from "@/lib/schema";
import { fmtPeriod, years } from "@/lib/format";
import ActionChip from "./ActionChip";
import { GroupGlyphs } from "./Glyph";

/** One precedent as a row with one hairline. `detail` adds the summary and labelled chips. */
export default function PrecedentRow({
  p,
  href,
  highlight,
  detail,
}: {
  p: Precedent;
  href?: string;
  highlight?: ActionType[];
  detail?: boolean;
}) {
  const types = [...new Set(p.actions.map((a) => a.type))];
  const where = p.government.state
    ? `${p.government.state.party} in ${p.government.state.name}, ${p.government.centre.party} at the Centre`
    : `${p.government.centre.party} at the Centre`;
  return (
    <Link href={href ?? `/precedents/${p.id}/`} className="row quiet">
      <span className="num text-ink-3 text-[15px]" title={fmtPeriod(p.period)}>
        {years(p.period.start, p.period.end)}
      </span>
      <span>
        <span className="row-title">{p.title}</span>
        <span className="block small mt-0.5">{where}</span>
        {detail && (
          <>
            <span className="clamp clamp-2 text-[15px] text-ink-2 mt-2 measure">{p.summary}</span>
            <span className="chips mt-3">
              {types.map((t) => (
                <ActionChip key={t} type={t} dim={highlight && !highlight.includes(t)} />
              ))}
            </span>
          </>
        )}
      </span>
      {!detail && <GroupGlyphs types={types} highlight={highlight} />}
    </Link>
  );
}

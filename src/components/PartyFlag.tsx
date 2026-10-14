import { flagFor } from "@/lib/party-flags";

/**
 * A small swatch of a party flag's colours. Bands only, no symbols, one size for every party.
 * A party with no sourced flag gets an empty outline of the same size, so no party stands out.
 */
export default function PartyFlag({ party, scale = 1 }: { party: string; scale?: number }) {
  const f = flagFor(party);
  // "other (...)" entries name an office or a group, not a party: no slot.
  if (!f && party.startsWith("other (")) return null;
  const W = 18;
  const H = 12;
  let at = 0;
  const total = f?.bands.reduce((n, b) => n + (b.share ?? 1), 0) ?? 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W * scale} height={H * scale} className="party-flag" aria-hidden="true">
      {f?.bands.map((b, i) => {
        const size = ((b.share ?? 1) / total) * (f.direction === "horizontal" ? H : W);
        const r =
          f.direction === "horizontal"
            ? { x: 0, y: at, width: W, height: size }
            : { x: at, y: 0, width: size, height: H };
        at += size;
        return <rect key={i} {...r} fill={b.hex} />;
      })}
      <rect x="0.5" y="0.5" width={W - 1} height={H - 1} rx="1.5" fill="none" className="party-flag-edge" />
    </svg>
  );
}

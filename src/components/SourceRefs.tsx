import type { Precedent } from "@/lib/schema";
import { credit } from "./Evidence";

/** Numbered links from a claim to its sources in the list at the foot of the page. */
export default function SourceRefs({ p, ids, className = "" }: { p: Precedent; ids: string[]; className?: string }) {
  return (
    <>
      {ids.map((id) => {
        const i = p.sources.findIndex((s) => s.id === id);
        if (i < 0) return null;
        const s = p.sources[i];
        return (
          <a key={id} href={`#source-${id}`} className={`link num ${className}`} title={credit(s) || s.title}>
            [{i + 1}]
          </a>
        );
      })}
    </>
  );
}

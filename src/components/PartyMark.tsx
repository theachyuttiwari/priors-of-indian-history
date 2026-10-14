import Link from "next/link";

export function partySlug(party: string) {
  return party.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function PartyMark({ party, role }: { party: string; role?: string }) {
  return (
    <Link href={`/parties/${partySlug(party)}/`} className="quiet inline-flex items-baseline gap-1.5">
      <span className="font-medium text-ink">{party}</span>
      {role && <span className="text-ink-3 text-xs">{role}</span>}
    </Link>
  );
}

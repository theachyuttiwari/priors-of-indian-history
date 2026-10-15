import type { MetadataRoute } from "next";
import { allParties, entryHref, entryUpdated, getCurrent, getPrecedents, siteUpdated } from "@/lib/content";
import { partySlug } from "@/components/PartyMark";
import { SITE_URL } from "@/lib/site";
import { allActions } from "@/lib/actions";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = siteUpdated();
  const pages = ["/", "/now/", "/precedents/", "/compare/", "/parties/", "/about/", "/corrections/"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: updated,
  }));
  const entries = [...getCurrent(), ...getPrecedents()].map((p) => ({
    url: `${SITE_URL}${entryHref(p)}`,
    lastModified: entryUpdated(p) ?? updated,
  }));
  const parties = allParties().map((party) => ({
    url: `${SITE_URL}/parties/${partySlug(party)}/`,
    lastModified: updated,
  }));
  const actions = allActions().map((x) => ({
    url: `${SITE_URL}${x.href}`,
    lastModified: entryUpdated(x.p) ?? updated,
  }));
  return [...pages, ...entries, ...actions, ...parties];
}

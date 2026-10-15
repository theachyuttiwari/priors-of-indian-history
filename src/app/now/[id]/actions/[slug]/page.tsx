import { notFound } from "next/navigation";
import { allActions, findAction } from "@/lib/actions";
import { isCurrent } from "@/lib/content";
import ActionView, { actionMetadata } from "@/components/ActionView";

type Params = { params: Promise<{ id: string; slug: string }> };

export function generateStaticParams() {
  const out = allActions()
    .filter((x) => isCurrent(x.p))
    .map((x) => ({ id: x.p.id, slug: x.slug }));
  // Static export needs at least one path; see the Now event page.
  return out.length ? out : [{ id: "none", slug: "none" }];
}

export async function generateMetadata({ params }: Params) {
  const { id, slug } = await params;
  return actionMetadata(findAction(id, slug));
}

export default async function NowActionPage({ params }: Params) {
  const { id, slug } = await params;
  const x = findAction(id, slug);
  if (id === "none") return <p className="text-ink-2">No current events yet.</p>;
  if (!x || !isCurrent(x.p)) notFound();
  return <ActionView x={x} />;
}

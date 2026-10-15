import { notFound } from "next/navigation";
import { allActions, findAction } from "@/lib/actions";
import { isCurrent } from "@/lib/content";
import ActionView, { actionMetadata } from "@/components/ActionView";

type Params = { params: Promise<{ id: string; slug: string }> };

export function generateStaticParams() {
  return allActions()
    .filter((x) => !isCurrent(x.p))
    .map((x) => ({ id: x.p.id, slug: x.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { id, slug } = await params;
  return actionMetadata(findAction(id, slug));
}

export default async function PrecedentActionPage({ params }: Params) {
  const { id, slug } = await params;
  const x = findAction(id, slug);
  if (!x || isCurrent(x.p)) notFound();
  return <ActionView x={x} />;
}

import { SITE_URL } from "@/lib/site";
import { robotsTxt } from "@/lib/robots";

export const dynamic = "force-static";

export function GET() {
  return new Response(robotsTxt(SITE_URL), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

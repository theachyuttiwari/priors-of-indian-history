import fs from "node:fs";
import path from "node:path";

/** Every exported HTML page under dir, as [file, URL path], skipping Next's own assets. */
export function pages(dir: string): [string, string][] {
  const list: [string, string][] = [];
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name !== "_next") walk(f);
      } else if (e.name.endsWith(".html")) {
        const rel = path.relative(dir, f).split(path.sep).join("/");
        list.push([f, "/" + rel.replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "")]);
      }
    }
  };
  walk(dir);
  return list.sort((a, b) => a[1].localeCompare(b[1]));
}

/** The not-found page in its three exported copies. */
export const isNotFound = (p: string) => p === "/404" || p === "/404/" || p === "/_not-found/";

/** Pages that get a Markdown twin: the section pages and every event and precedent entry. */
export function hasTwin(p: string): boolean {
  if (["/", "/now/", "/precedents/", "/compare/", "/parties/", "/about/", "/corrections/"].includes(p)) return true;
  return /^\/(now|precedents)\/[^/]+\/$/.test(p);
}

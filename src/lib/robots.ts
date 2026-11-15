/**
 * robots.txt. Every crawler may read every page, AI crawlers included (owner default, 2026-11-15).
 * Each AI agent is named so the policy is explicit. Content-Signal follows contentsignals.org.
 * On a project address (user.github.io/repo) crawlers read only the host's root robots.txt, so this
 * file states the policy but takes effect only on a domain of the site's own.
 */
export const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export function robotsTxt(siteUrl: string): string {
  const signal = "Content-Signal: search=yes, ai-input=yes, ai-train=yes";
  const agents = AI_AGENTS.map((ua) => `User-agent: ${ua}`).join("\n");
  return `User-agent: *\nAllow: /\n${signal}\n\n${agents}\nAllow: /\n${signal}\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

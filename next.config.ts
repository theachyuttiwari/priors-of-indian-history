import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Only for a GitHub Pages project address (user.github.io/repo). Leave unset on a custom domain.
  basePath: process.env.PRIORS_BASE_PATH || undefined,
};

export default nextConfig;

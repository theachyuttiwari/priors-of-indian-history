import type { MetadataRoute } from "next";
import { DESCRIPTION } from "@/lib/site";

export const dynamic = "force-static";

/** Next adds the base path to its own links, but not to paths inside the manifest. */
const BASE = process.env.PRIORS_BASE_PATH || "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Priors: how India’s governments have handled protests",
    short_name: "Priors",
    description: DESCRIPTION,
    start_url: `${BASE}/`,
    scope: `${BASE}/`,
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: `${BASE}/icon.svg`, sizes: "any", type: "image/svg+xml" },
      { src: `${BASE}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${BASE}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${BASE}/icons/icon-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

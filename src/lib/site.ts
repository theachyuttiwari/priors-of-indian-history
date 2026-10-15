export const REPO = "https://github.com/theachyuttiwari/priors-of-indian-history";

/** Decision F: until the project domain and its corrections address exist, errors are reported here. */
export const CORRECTION_FORM = `${REPO}/issues/new?template=correction.yml`;

/**
 * Public address of the site, for the sitemap and share cards. Set PRIORS_SITE_URL when building
 * for deployment (the deploy workflow reads it from the SITE_URL repository variable).
 */
export const SITE_URL = (process.env.PRIORS_SITE_URL ?? "http://localhost:4321").replace(/\/$/, "");

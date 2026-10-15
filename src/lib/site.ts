export const REPO = "https://github.com/theachyuttiwari/priors-of-indian-history";

/** Decision F: until the project domain and its corrections address exist, errors are reported here. */
export const CORRECTION_FORM = `${REPO}/issues/new?template=correction.yml`;

/**
 * Counts of actions by party. Each action is attributed by place and date (content/governments).
 * Set to false to hide every count, for example if the attribution tables are found to be wrong.
 */
export const PARTY_COUNTS = true;

/** Shown wherever party counts would appear while PARTY_COUNTS is off. */
export const PARTY_COUNTS_PAUSED =
  "Counts of actions by party are paused. Some protests crossed state lines or outlasted a government, and each entry now records only one state government, so some actions would be counted for the wrong party. We are fixing this. Each entry names who governed where.";

/**
 * Public address of the site, for the sitemap and share cards. Set PRIORS_SITE_URL when building
 * for deployment (the deploy workflow reads it from the SITE_URL repository variable).
 */
export const SITE_URL = (process.env.PRIORS_SITE_URL || "http://localhost:4321").replace(/\/$/, "");

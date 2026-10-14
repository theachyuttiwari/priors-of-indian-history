# Security policy

## Report a vulnerability

Do not open a public issue for a security problem.

Use GitHub private vulnerability reporting:

1. Go to the **Security** tab of this repository.
2. Select **Report a vulnerability**.
3. Describe the problem, the steps to reproduce it, and the impact.

The maintainer will reply within 7 days.

## Scope

Priors is a static site with no server, no accounts and no user data. Reports are most useful for:

- the build and CI workflows in `.github/workflows/`, including secret handling;
- the ingestion pipeline in `pipeline/`, which reads web content and writes YAML;
- dependencies that ship in the built site.

## Not security issues

A wrong fact, a broken source link or a misquote is a content error, not a vulnerability. Open a
**Correction request** issue instead. Corrections are handled in public so that readers can see them.

## Supported versions

Only the current `main` branch and the deployed site are supported.

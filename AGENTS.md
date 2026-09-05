# AGENTS.md

## Project

This is the source for appseccharlie.com, a small static personal site.

Production site content lives under `public/`.

Keep changes focused. Do not redesign the site, rewrite approved copy, or add dependencies unless the task requires it.

## Development

Use the repository's existing Node/npm setup.

Install dependencies with:

```bash
npm ci
```

Run browser tests with:

```bash
npm test
```

Use Chromium only unless the task explicitly requires additional browsers.

## Verification

Before completing changes:

- Run the Playwright suite.
- Check for browser console/page errors.
- Verify there is no unintended horizontal overflow.
- For visual changes, capture and inspect desktop and mobile screenshots.
- Keep generated Playwright reports, screenshots, traces, and test results out of git.

## Style

- Preserve the existing dark visual identity and green accent unless explicitly asked otherwise.
- Do not introduce em dashes in user-facing copy.
- Do not change approved copy as a side effect of layout work.
- Prefer minimal dependencies and simple static-site solutions.

## Git / PR provenance

For commits materially assisted by an AI coding agent, add a `Co-authored-by:` trailer when the agent provides an appropriate identity. Do not invent an identity.

For AI-assisted pull requests, append the following metadata at the end of the PR description when known:

```text
AI-Assisted-By: <tool or agent>
AI-Model: <model>
AI-Reasoning: <reasoning level>
```

Omit unknown fields. Do not guess or invent provenance metadata.

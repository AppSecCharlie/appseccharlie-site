# AGENTS.md

## Project

This is the source for appseccharlie.com, a small static personal site.

Editable site source lives under `src/`. Eleventy writes generated output to `_site/`.

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

## Field Notes

- Field Notes source files live in `src/field-notes/`.
- Add notes as Markdown, using an existing note as the front-matter example.
- New notes should use `draft: true` unless they are explicitly intended for publication. Drafts are available through `npm run dev` but excluded from production builds.
- Do not hard-code display note numbers in filenames, slugs, or article content. The site generates note numbering and index metadata.
- Keep a note's filename-derived slug stable after publication.
- Do not edit generated `_site/` output directly.
- Run the production build and relevant tests before considering a note ready to publish.

## Style

- Preserve the existing paper, ink, graphite, and ballpoint-blue field-journal design unless explicitly asked otherwise.
- Do not introduce em dashes in user-facing copy.
- Do not change approved copy as a side effect of layout work.
- Prefer minimal dependencies and simple static-site solutions.

## Agent provenance and authority

- Keep changes scoped to the requested task. Do not make unrelated cleanup changes.
- For commits materially assisted by an AI coding agent, add a `Co-authored-by:` trailer using the agent's provided identity. Do not invent an identity.
- For AI-assisted pull requests, append this metadata when known:

  ```text
  AI-Assisted-By: <tool or agent>
  AI-Model: <model>
  AI-Reasoning: <reasoning level>
  ```

- Omit unknown provenance fields rather than guessing them.
- Do not push, publish releases, move refs, merge pull requests, or change repository settings unless explicitly authorized.

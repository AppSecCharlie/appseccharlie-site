---
title: The Afterlife of a Bug Report
date: 2026-09-13
description: A small example of how public technical traces can become context for AI-assisted engineering long after they're created.
draft: false
---

Most of my code-related work happens in private enterprise repositories, so my public GitHub history is a pretty narrow slice of what I work on.

That made something I stumbled across recently interesting. In early 2025, I filed a [bug report against GitHub's Dependency Review action](https://github.com/actions/dependency-review-action/issues/892) after running into odd behavior with dependency snapshots in reusable workflows. I documented the failure, what I'd tried, and the behavior I could reproduce.

More than a year later, I started finding the issue cited in unrelated pull requests. Looking closer made the mechanism less mysterious and more interesting.

At least some of those citations came from CodeRabbit, an AI code-review tool that can search the public web for technical context while reviewing a pull request. In [one review](https://github.com/elementary-data/dbt-data-reliability/pull/1031), it pulled my issue into a set of sources about Dependency Review failures alongside GitHub documentation and other bug reports.

It hadn't found *me*. It had found an artifact that happened to contain useful evidence for the problem it was trying to solve.

**Public technical traces may have a longer afterlife now. The issue you write for today's maintainer can become context for an agent solving someone else's problem years later.**

---
title: The Org Chart Isn't the Trust Boundary
date: 2026-11-07
description: "The hard part comes after the prototype: making software safe to share and use, regardless of who built it."
draft: false
italicDescription: true
---

An engineer writes a script that modifies customer records in production. Someone in Sales uses Claude to build a read-only internal dashboard over an approved dataset.

Both are building software. The engineer's script carries substantially more risk because of what it can do, not because of who built it.

AI makes it easier for people across an organization to build working software. But a prototype that runs on someone's laptop isn't yet a tool others can use.

To get there, it needs somewhere to run, access to approved data and systems, perhaps persistent state, an identity, and someone accountable when it breaks.

Engineering teams already have ways to meet these needs: deployment pipelines, runtimes, storage, service identities, and observability.

When people outside Engineering build tools, we often call it *citizen development*. The term is useful shorthand, but it invites a false dichotomy. They're building software with many of the same needs as builders inside Engineering, even if they shouldn't have to operate the underlying infrastructure.

One response is to create a separate development platform for everyone outside Engineering. But is that the right boundary?

The relevant questions are the same ones we'd ask of anything built by Engineering: What can it read, change, invoke, or cause another system to do? Whose authority does it exercise? Who can use it? How do we know it's behaving as intended?

**The answers should determine the controls, not the builder's department.**

That doesn't mean every application needs the same runtime, approval process, or operational guarantees. An internal dashboard, a scheduled workflow, and a customer-facing service have different requirements. What they share is the need for a reliable path from prototype to something others can safely use.

**The org chart still tells us who is responsible. It doesn't tell us where the trust boundaries belong.**

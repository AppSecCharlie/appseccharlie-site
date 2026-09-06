---
title: Turning Judgment into Infrastructure
date: 2026-09-06
description: Encoding the repeatable parts of expert judgment into systems that can apply them consistently over time.
draft: true
---

A lot of security automation starts with a task: run this scanner, open this ticket, send this alert. I’m more interested in the judgment that determines what should happen next. When experienced people keep making the same kind of decision, some part of that reasoning may be stable enough to encode.

The form varies. It might become a workflow, a Terraform module, a dashboard that puts the right evidence in front of someone, an agent that proposes a code change, or a bot that can apply a security team’s accumulated judgment to a new question. Sometimes it’s a system that checks its own output over time, so a change can prove that it still preserves the behavior it was meant to replace.

The goal isn’t to automate every decision. It’s to move the repeatable parts somewhere more durable, along with enough evidence to know the mechanism is still doing what we intended, and leave people with the cases that are actually new.

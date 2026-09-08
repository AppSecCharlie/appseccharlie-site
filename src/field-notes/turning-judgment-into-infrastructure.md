---
title: Turning Judgment into Infrastructure
date: 2026-09-06
description: Encoding the repeatable parts of expert judgment into systems that can apply them consistently over time.
draft: false
---

A lot of repeated work starts at the task layer: answer this question, review this change, make this decision. After enough repetitions, ask whether some of the judgment behind that work has become stable.

Once it is stable enough, it can move out of someone’s head and into the system. A Terraform module can encode a good infrastructure pattern. A bot can apply a security team's accumulated decisions to recurring questions. An agent can recognize a familiar code issue and propose or make the fix.

The trick is not to encode more than you know. **Encode the invariants, preserve the exceptions, and instrument the mechanism so reality can tell you when the model is wrong.** Let it run. Watch where people override it, where edge cases accumulate, and where the assumptions stop holding. Those exceptions are feedback about what should be encoded next, or what should stay human.

**That's when judgment becomes infrastructure: the routine cases stop consuming human attention, and the exceptions become feedback for the next version of the system.**
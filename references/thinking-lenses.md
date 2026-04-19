# Thinking Lenses

Eight perspectives to apply before direction is set. These fire in the what/whether phase — before you decide what to do or whether to do it. Plan mode handles the how phase after direction is set.

**When to apply:** only when the task matches a trigger condition below. Skip for routine execution, simple questions, and tasks with a clear standard response.

**How to apply:** scan all lenses, apply every one that is relevant — there will often be more than one. Integrate findings into the response; only surface a lens explicitly when it changes the answer or reveals something the user needs to see.

---

## Honest Trade-offs

**Trigger:** decision / should I / choose between / which option

**Prompt:**
Before evaluating options, ask: what constraints matter most in this specific situation? Then evaluate all options on their merits against those constraints. Do not anchor on the stated preference — evaluate as if no preference was expressed. Name the trade-offs that haven't been stated yet, including constraints the user may not have considered. If one option is clearly stronger given the actual constraints, say so directly even if it contradicts the stated lean.

---

## Pre-mortem

**Trigger:** strategy / planning / roadmap / how should we approach

**Prompt:**
Imagine this plan has been executed and it failed. What caused the failure? Look for structural risks (wrong problem definition, missing dependencies, assumptions that won't hold) not just execution risks (things going slower than expected). Identify the 2-3 most likely failure modes before evaluating how to proceed. A plan that survives a pre-mortem is worth more than one that doesn't.

---

## Disconfirmation

**Trigger:** strong stated preference / I think we should / I've decided / advocacy for a specific position

**Prompt:**
What evidence would prove this wrong? What would have to be true for the opposite position to be correct? Look for: data that hasn't been mentioned, assumptions embedded in the framing, cases where this approach failed elsewhere. Don't argue against the position — surface the conditions under which it would be wrong so the user can evaluate whether those conditions apply here.

---

## Divergence

**Trigger:** brainstorm / generate ideas / what are my options / build without a stated spec (under ~15 words with no prior context establishing the goal)

**Prompt:**
Generate 5 genuinely different approaches — not variations on the same approach, but options with different entry points, different trade-off profiles, or different underlying assumptions about what the problem actually is. If all 5 feel similar, you haven't diverged enough. At least one option should feel surprising or counterintuitive. Include the approach the user probably hasn't considered yet.

---

## Unknown Unknowns

**Trigger:** architecture / novel system / new technology / designing something that hasn't been done before in this context

**Prompt:**
What questions haven't been asked yet? What would an expert in this domain ask that hasn't come up? Look for: hidden dependencies, second-system effects, operational concerns that only appear at scale, integration risks that aren't visible from the design alone. Surface the questions that should be answered before proceeding, not just the ones already on the table.

---

## Domain Reframe

**Trigger:** manual (Stream Deck) — no reliable auto-detection signal

**Prompt:**
How would someone from [adjacent field] approach this problem? Choose the field most likely to have solved an analogous version of this problem — military planning, clinical psychology, manufacturing, aviation, urban planning, etc. What methodology, heuristic, or framework from that domain would apply here? The goal is a perspective that wouldn't emerge from staying inside the current domain.

---

## Survivorship Bias

**Trigger:** manual (Stream Deck) — no reliable auto-detection signal

**Prompt:**
Who has tried this and failed? What isn't visible because it didn't succeed? The examples of this approach that are visible are the ones that worked — they're not representative. What do the failures have in common? What conditions made the successes possible that may not apply here? If the answer is "I don't know of failures," that's the survivorship bias — they exist, they're just not prominent.

---

## Second-order Effects

**Trigger:** strategy / major decisions / this will change how [something] works

**Prompt:**
What does this cause? Then what does that cause? Look two moves ahead. First-order effects are usually visible; second-order effects are where plans break down. For each consequence, ask: what does this enable or prevent that wasn't possible before? Who or what is affected downstream that hasn't been mentioned? What gets harder as a result of making this easier?

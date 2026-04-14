# CRP Tool — Product Strategy

---

## Epistemic ground rules

Every claim in this document is labelled:
- **Known** — confirmed by the brief, PPN 006 policy text, or domain knowledge
- **Assumed** — a reasonable inference, stated explicitly so it can be tested
- **Unknown** — genuinely unresolved; no fabrication in its place

Assumed facts are not treated as known until validated with real users or buyers.

---

## Outcome

> A procurement officer reaches a confident, auditable compliance determination on a supplier CRP faster, with less effort, and with less risk of inconsistency than the current manual process.

**North star metric** (Cutler): *Minutes per supplier compliance determination reaching audit-ready status.*

**Assumed:** "Audit-ready" means a complete, reconstructable record of: the document assessed, the criteria version used, the AI determination per criterion with the evidence it used, and the officer's logged response to any flagged item.

**Unknown:** What the current baseline time is. The claim that the tool is "faster" cannot be substantiated without observing the manual process. This is the most important gap in the value proposition.

---

## Diagnosis

**Assumed — requires validation through user research.**

Procurement teams cannot reliably verify CRP compliance at scale. The manual process requires reading unstructured documents against 11+ criteria, cross-referencing self-reported claims with external registers, and recording determinations in a way that can withstand challenge — all without tooling designed for this purpose. The result is slow, inconsistent, and difficult to audit.

Three specific failure modes drive this:
1. Documents vary wildly in structure and location — no standard format exists
2. Criteria require interpretation — the same document can produce different determinations from different officers
3. Self-reported certifications and emissions figures cannot be practically cross-referenced at the volume and speed procurement requires

**If this diagnosis is wrong** — if the manual process is already fast and consistent, or if officers don't feel the pain — the product has no value proposition. Validating the diagnosis is the first job.

---

## Guiding Policy

**Augment the officer; do not replace them.**

Build a tool that structures the CRP review process — extracting relevant content per criterion, evaluating it, and producing a draft determination with the evidence it used. The officer confirms, challenges, or overrides each finding. Every determination is logged with enough detail to reconstruct the decision if challenged.

**Why not full automation:** Government accountability norms require a human to own the decision. Trust in AI determinations has not been established. Automation without trust is liability.

**Why not platform integration first:** We do not yet know where documents arrive or which procurement systems buyers use. Building integration before validating the core concept inverts the risk order.

**Why not manual process improvement (checklists, templates):** Structured templates help with consistency but do not address the cross-referencing problem or the time cost of reading unstructured documents against 11+ criteria.

---

## Prioritised Opportunities

Scored using Torres' opportunity framing: **importance** (if true, how much does it matter?) × **unmet need** (how poorly is it addressed today?). Pre-research estimates — confidence is low; this is a prioritisation of *what to validate first*, not what to build.

| Priority | Hypothesis | Importance | Unmet today | Why this order |
|---|---|---|---|---|
| 1 | **H2 — Reading and interpreting criteria is slow and inconsistent** | High — this is the core manual work | High — no tooling exists for this | If wrong, there is no product. Validate first. |
| 2 | **H7 — The sign-off criterion is being missed** | High — a known PPN 006 requirement | Unknown — likely inconsistent | Specific, checkable, high-stakes. Good prototype test. |
| 3 | **H6 — The audit trail is inadequate** | High for buyers; medium for officers | High — no standard exists | Directly addresses accountability risk; the buyer case |
| 4 | **H3 — Supplier claims cannot be practically verified** | Medium-high | High — cross-referencing is not feasible manually | Strong demo moment; partially addressable without live APIs |
| 5 | **H1 — Finding the document is a significant time cost** | Medium | Medium — some documents arrive via tender platform | Real friction, but not the core value. Partially solvable with URL input. |
| 6 | **H5 — Tool-switch friction** | Medium | Unknown | Only relevant after the core tool proves its value |
| 7 | **H4 — Compliance treated as one-time event** | Low-medium | Unknown | Most speculative; depends on longitudinal behaviour not yet observed |

**What this means for now:** The prototype should lead with H2 and H7. They test the core value claim and the trust model directly. H6 is the output — the audit log is what makes the buyer case. H3 adds credibility. H1, H5, H4 are not prototype territory.

---

## Prototype Direction

**Primary question the prototype must answer:**

> Do procurement officers trust an AI-produced finding enough to act on it — without reading the source document themselves?

Everything in the prototype is in service of this question. Secondary questions it should surface:

- Is seeing the extracted source text enough to verify a finding, or do officers still want to read the full document?
- Does the sign-off criterion feel like a distinct check, or is it treated the same as substantive criteria?
- Is the per-criterion audit log more or less detail than a buyer would need?
- Where does the document actually come from in their workflow — and is URL input a reasonable starting point?

**What the prototype commits to (design bets, not product decisions):**

| Hypothesis | Bet | What reaction it's trying to provoke |
|---|---|---|
| H2 — criteria reading | Evidence-first: AI finding + extracted source text shown together | "Is seeing the source text enough, or do you still need to read the whole thing?" |
| H7 — sign-off criterion | Distinct check, separate from substantive criteria | "Do you currently check this separately, or is it just part of the read?" |
| H6 — audit trail | Per-criterion log: extracted text, AI determination, officer response | "Is this more or less detail than you'd need to defend a decision?" |
| H3 — claim verification | Flag as "stated, not verified" with link to register | "Would auto-verification change anything for you, or is the flag enough?" |
| H1 — document discovery | User provides URL or PDF | "Would you actually do it this way, or does the document come to you differently?" |
| H5 — tool-switch | Standalone tool | "Would you use this as a separate step, or does it need to sit inside [platform]?" |
| H4 — one-time compliance | Not shown | Too speculative without observing longitudinal behaviour |

**Gate: what the prototype needs to produce before moving to discovery**

- At least one buyer or procurement officer has seen it and had a genuine, specific reaction (not "interesting")
- At least one assumption from the unknowns table has been confirmed or invalidated
- At least one question has emerged that the prototype cannot answer — something that requires talking to real users

**Demo questions — what to listen for in every prototype showing**

These are not a script. They are the questions the demo should answer. Listen for the answer; if it doesn't come up naturally, ask directly at the end.

| Question | Hypothesis it tests | What a useful answer looks like |
|---|---|---|
| "Is seeing the source text enough, or would you still want to read the whole document?" | H2 — trust model | A specific reason why, not just yes/no |
| "How does the CRP usually reach you — do you find it, or does it come to you?" | H1 — document discovery | Specific workflow detail: platform, email, attachment, link |
| "Who in your organisation would need to see the outcome of this check?" | H6 — audit trail / persona | Names a role — procurement lead, audit team, legal — that isn't the officer |
| "Would you feel comfortable acting on this without reading the document yourself?" | H2 — core trust question | Hesitation is as useful as yes |
| "Does the sign-off check feel like a separate step, or is it just part of the read?" | H7 — sign-off criterion | Whether they treat it as distinct in their current process |
| "What would you need to see to show this to your procurement lead?" | H6 — buyer case | Surfaces the buyer requirement from the user's perspective |
| "Is there anything here that doesn't match how you actually work?" | All | Open door for workflow correction |

---

## Requirements

Requirements at this stage are written for the three hypotheses the prototype is already demonstrating: H2, H7, and H6. They are assumption-backed — written from known policy and the guiding policy, not from observed user behaviour. They are labelled as such and should be tested against discovery findings before being treated as committed.

Requirements for H1, H3, H4, H5 wait for discovery.

---

### R1 — Criteria assessment with evidence (H2)

**User need:** A procurement officer checking a supplier's CRP needs to reach a determination on each PPN 006 criterion without reading the full document, so they can complete a check more quickly and consistently than the manual process.

**We know this because:** Known — the manual process involves reading an unstructured document against 11+ criteria with no tooling. Assumed — this is slow and inconsistent. Not yet confirmed through observation.

**Success looks like:** The officer can state a determination on each criterion having reviewed AI-extracted evidence rather than the source document. They can challenge or override any finding. The time taken is less than the manual alternative.

**Out of scope:** Comparative assessment across suppliers; trend analysis; batch processing.

---

### R2 — Sign-off as a distinct check (H7)

**User need:** A procurement officer needs to confirm that a CRP has been signed off by a qualifying board-level director as a named, separate check — not bundled into the substantive criteria — so that a non-compliant CRP cannot be approved on content alone.

**We know this because:** Known — PPN 006 explicitly requires director-level sign-off. This is a policy requirement, not a judgement call.

**Success looks like:** The sign-off check is surfaced as a distinct named step. It cannot be skipped. A CRP cannot reach a compliant determination if the sign-off check is incomplete or flagged.

**Out of scope:** Verification of the signatory's actual board-level status via Companies House or equivalent. That requires a separate integration and is out of scope for the prototype.

---

### R3 — Reconstructable audit record (H6)

**User need:** An assurance or audit function needs to reconstruct how a compliance determination was reached — what the AI found, what evidence it used, and what the officer decided — so that a procurement decision can be defended if challenged.

**We know this because:** Known — procurement decisions must be defensible. PPN 006 compliance is a condition of participation; a failed check must be explainable to the supplier.

**Success looks like:** A complete record exists for each assessment: document assessed, PPN 006 version used, AI determination per criterion with the extracted text it used, officer action (confirmed / overridden / flagged), timestamp. The record is immutable once the determination is logged.

**Out of scope:** Role-based access controls; formal exportable report; multi-user permissions. These follow once the data model is confirmed through discovery.

---

## Strategic Stepping Stones

The end vision: a compliance verification service embedded in government procurement workflows, trusted by officers, defensible by procurement leads, and extensible across procurement policy (not just PPN 006).

Each stepping stone resolves something that the next one depends on. These are validation gates, not delivery phases.

---

### 1 — Make the concept legible *(now — prototype)*

**Goal:** A buyer or procurement officer who sees the prototype understands what the tool does and has a genuine reaction — either "yes, I need this" or "that's not how it works." Both are useful.

**What it resolves:** Whether the concept is communicable at all. If buyers cannot engage with it, nothing else matters.

**Decision it unlocks:** Is there enough signal to invest in discovery?

---

### 2 — Discovery *(no direct user access available)*

**Goal:** Reduce the assumption load enough to build with more confidence. Direct user research isn't currently available. Use what is.

**Available methods, in order of reliability:**

- **Prototype demo reactions** — treat buyer and stakeholder demos as structured discovery, not just sales. The reactions they provoke are data. See the demo questions above.
- **Published sources** — NAO reports on procurement failures surface where the process breaks down in practice. Government commercial function guidance. Published procurement frameworks. PPN 006 itself.
- **Adjacent practitioners** — procurement consultants, former public sector commercial leads, colleagues or stakeholders on the main build team with buyer-side access.
- **Desk research** — published case studies, FOI responses, academic work on public procurement compliance.

**What this step cannot do:** Resolve the workflow unknowns (how documents actually arrive, what the manual process looks like step by step) without someone who does the job. Those remain open until direct access is available.

**What it should resolve:** Which hypotheses have published or observable evidence behind them. Which are purely assumed. Whether the prototype's trust model bet (evidence-first) produces the right reactions in demo.

**Decision it unlocks:** Which hypotheses are worth building for. Identifies likely beachhead candidates. Confirms or challenges the persona assumption.

---

### 3 — Identify the beachhead *(Moore, Crossing the Chasm)*

**Goal:** One department, one workflow, one use case. Understand their specific process deeply enough to shape the product around it.

**What it resolves:** The persona is no longer "a procurement officer" — it's "a commercial lead at [department] running PPN 006 checks on [type of tender]." That specificity is what makes the product good enough to win the chasm.

**Decision it unlocks:** What the first real product needs to do. Resolves the service vs. platform question for the beachhead — even if the long-term answer is different.

---

### 4 — Resolve the trust model *(highest-uncertainty design problem)*

**Goal:** Find out whether officers will act on an AI determination, and under what conditions. The prototype bets on evidence-first — this gate confirms whether that bet was right.

**What it resolves:** The review UX, the confidence threshold model, and the liability framing. The officer review and confirmation workflow is Genesis-stage (Wardley) — no established pattern exists; highest design uncertainty.

**Decision it unlocks:** What "AI-assisted" actually means in this product. Is the officer reviewing findings, or just exceptions? That choice shapes the entire interaction model.

---

### 5 — Establish an extraction quality threshold

**Goal:** Define what accuracy level makes the tool trustworthy enough to be decision-support rather than a liability. This is a calibration question that requires real documents and real criteria.

**What it resolves:** Feasibility risk (Cagan). A tool that gets criteria wrong at a meaningful rate is worse than no tool — it introduces a new failure mode without removing the old one.

**Decision it unlocks:** Whether the AI pipeline is production-ready, or whether the product needs a different approach to low-confidence determinations (e.g. mandatory human review for specific criteria).

---

### 6 — Win the first contract *(chasm crossing)*

**Goal:** One paying government department, using the tool in their real procurement process.

**What it resolves:** Business viability risk (Cagan). Also produces the reference case that Moore's model requires to cross to the early majority.

**Decision it unlocks:** Whether to deepen for the beachhead or extend to adjacent departments and PPNs.

---

### 7 — Extend to platform *(Pope, Platformland)*

**Goal:** If the tool works for one PPN, it can work for others. If it works for one department, others will follow — but only if the first contract is a reference case, not an exception.

**What it resolves:** The scope question — PPN 006 only, or a procurement policy compliance platform more broadly? That is a different product, with different infrastructure and a different commercial model.

**What it requires:** A successful beachhead that can be generalised. Do not attempt this step before step 6 produces a working case study.

---

## Key Decisions

Cannot be made until the stepping stone above them is complete.

1. **Service or platform?** (Pope, *Platformland*) — Standalone tool or embedded API. Depends on where documents arrive and which procurement systems buyers use. Resolved at stepping stone 3.
2. **What is the trust model?** — Officer confirms all findings, or only exceptions. Resolved at stepping stone 4.
3. **What is in scope?** — PPN 006 only, or a platform for procurement policy compliance more broadly? Resolved at stepping stone 7.

---

## Buyer ≠ User

| | Buyer (procurement lead, signs the contract) | User (procurement officer, uses it daily) |
|---|---|---|
| Success | Defensible decisions, audit trail, compliance assurance | Speed, trustworthy output, fewer steps |
| Risk | Being challenged on a procurement decision | Being blamed for acting on a wrong AI output |
| What they need | Governance, version history, role controls | Fewer steps, clear next actions, no jargon |

When these conflict — and they will — the product needs a clear rule for which takes priority. The prototype should surface whether they actually conflict in practice, or whether officers and buyers want the same thing from slightly different angles.

---

## What the Prototype Is For

The prototype is a design and product exploration artefact. It sits outside the product entirely — not a phase, not a milestone, not a precursor that gates anything.

Its job is to make the concept legible: show a realistic, coherent user journey that prompts a genuine response from a buyer or procurement officer, and surface the right questions for the product team to answer.

It informs the product. It is not part of it.

---

## Reference: Known, Assumed, Unknown

### What Is Known

These are not assumptions. They come from PPN 006 policy text and the product brief.

- Suppliers bidding for UK government contracts above £5m per annum must submit a CRP as a condition of participation
- PPN 006 applies under the Procurement Act 2023 to goods, services, and works where relevant and proportionate
- CRPs must be signed off by a board-level director or equivalent — this is a distinct criterion, not just document content
- Suppliers are required to publish their CRP publicly on their company website
- PPN 006 has evolved since PPN 06/21; criteria have been updated and are likely to continue evolving
- The manual process involves: locating the CRP, reading it against a criteria list, and making a pass/fail determination
- There is no standard format for CRPs — they vary in structure, format (PDF, web page, embedded in annual reports), and location
- Claimed certifications (SBTi, ISO 14001) and emissions figures are self-reported with no mandatory cross-referencing

### What Is Assumed

| Assumption | Basis | Risk if wrong |
|---|---|---|
| The manual process takes significantly longer than the tool would | Complexity of matching 11+ criteria across unstructured documents | If the manual process is already fast enough, the time-saving case collapses |
| Inconsistency between officers is a real problem | Interpretation of ambiguous language is inherently subjective | If officers are already highly consistent, uniformity is not a differentiator |
| The primary user is the person evaluating tender submissions | Most likely to be doing this work; role title varies by organisation | Wrong persona = wrong product |
| Officers currently locate CRPs themselves from supplier websites | PPN 006 requires public publication; no indication of systematic delivery mechanism | If CRPs routinely arrive via tender platforms, discovery is already handled |
| A false positive (approving non-compliant) is more harmful than a false negative (rejecting compliant) | Non-compliance is a regulatory risk; a rejected compliant supplier can appeal | If appeals are costly to manage, false negatives may be equally bad |
| The tool is a decision-support tool, not a decision-making tool | Government accountability norms | If buyers want full automation, the review UX is unnecessary friction |
| SBTi and UKAS are the highest-value cross-reference sources | Most commonly claimed credentials in sustainability contexts | Other certifications may matter more to buyers in practice |
| No competing product currently does this well | Unknown — no market research has been done | If something already exists, differentiation must be argued |

### What Is Unknown (No Fabrication)

| Unknown | Why it matters |
|---|---|
| What triggers a CRP check in practice | Determines the entry point — reactive tool vs proactive, standalone vs integrated |
| Where the document currently arrives (platform, email, officer-finds-it) | Determines whether to build discovery, intake, or integration |
| Which role actually does CRP checking | The persona may not be "procurement officer" — could be a sustainability lead, commercial lead, or admin |
| What the manual process looks like in detail | Required to establish a baseline and validate that the tool improves on it |
| Whether officers want to confirm AI findings or only exceptions | Determines the trust model and the review UX |
| Whether existing procurement platforms support outbound events or API integration | Determines feasibility of deeper integration options |
| What "audit-ready" means to a real buyer organisation | The assumed definition above may not match what buyers actually need for compliance |
| Whether a competing product already exists | No market research has been done |

---

## Reference: Hypotheses

### H1: Finding the document is a significant time cost

**Hypothesis:** Officers spend meaningful time locating CRPs, because suppliers bury them inconsistently.

**Why plausible:** Known — suppliers are required to publish CRPs but no format or location is mandated.

**Options if true:**
- Given a company name, the tool discovers and fetches the CRP automatically
- Accept user-provided input (URL or PDF) — reduce discovery work without automating it
- Receive the CRP from the tender platform as part of the submission flow

**What would invalidate this:** CRPs routinely arrive attached to tender submissions — officer never needs to find them.

---

### H2: Reading and interpreting criteria is slow and inconsistent

**Hypothesis:** Officers spend significant time reading full documents and matching content to 11+ criteria, and different officers reach different conclusions from the same document.

**Why plausible:** Criteria involve subjective interpretation (e.g. distinguishing genuine net zero commitments from aspirational language). Known from the brief.

**Options if true:**
- AI produces findings; officer confirms each one
- Exception-only: auto-accept high confidence, surface only ambiguous and failures
- Evidence-first: show extracted document text per criterion alongside the determination

**What would invalidate this:** Officers work from a structured template that makes the process fast and consistent already.

---

### H3: Supplier claims cannot be practically verified

**Hypothesis:** Officers accept self-reported certifications and figures at face value because manual cross-referencing is not feasible.

**Why plausible:** Checking SBTi, UKAS, and SECR manually for every supplier on every tender is too slow to be routine.

**Options if true:**
- Automatically query public registers and surface the result inline
- Flag claims as "stated, not verified" — lower bar, still adds value
- Link to registers for one-click verification

**Caveat:** External sources have different reliability. SBTi and UKAS are authoritative. SECR (Companies House) has known data quality issues — delayed filings, incorrect data. CDP requires a commercial relationship. These are not equivalent sources.

**What would invalidate this:** Buyers already have a process for checking certifications, or they consider it out of scope.

---

### H4: Compliance is being treated as a one-time event when it shouldn't be

**Hypothesis:** CRPs expire and are re-published annually, but buyer organisations have no systematic way to track this, leading to reliance on outdated assessments.

**Options if true:**
- Expiry signals and re-assessment prompts on supplier records
- Monitor known supplier CRP URLs and alert on significant changes
- Record which PPN 006 version was used per assessment so historical comparisons are possible

**What would invalidate this:** Buyers treat each tender as independent — they re-check every supplier fresh each time regardless.

---

### H5: The tool-switch from procurement workflow creates friction

**Hypothesis:** CRP checking as a separate tool adds a step rather than removing one, reducing adoption.

**Options (in order of integration depth):**
- Accept the tool-switch — make standalone good enough that friction is worth it
- Batch import — officer exports supplier list from procurement platform and imports it
- Trigger-based — procurement platform sends an event when a check is required
- Platform API — CRP validation is a service procurement platforms call directly; no separate tool (Pope, *Platformland*)

**What would invalidate this:** Officers are willing to context-switch if the tool is significantly better than the alternative.

---

### H6: The audit trail is inadequate and creates risk

**Hypothesis:** There is no standard way to record how a CRP determination was reached, which creates risk if a decision is challenged.

**Options:**
- Log AI outcome and officer confirmation per assessment
- Log per-criterion: extracted text, AI determination, officer response to each flagged item
- Generate a formal report attachable to the procurement record

**Tension:** The officer wants speed; the procurement lead wants defensibility (Rachitsky). Detailed per-criterion logging adds completeness for the buyer but adds friction for the officer.

---

### H7: The sign-off criterion is being missed

**Hypothesis:** The requirement for CRPs to be signed by a board-level director is currently checked inconsistently — or not at all — because it requires judgement about whether the signatory qualifies.

**Why this matters:** Known — PPN 006 explicitly requires director-level sign-off. A CRP that meets all substantive criteria but lacks a qualifying signatory is non-compliant. This is a distinct problem from document content extraction and may require a different approach.

---

## Appendix: Design Lenses

These frameworks were used to stress-test the diagnosis, guiding policy, and opportunity prioritisation above. They are evidence for decisions already made, not additional structure.

---

### De-risking before building (Cagan, *Inspired*)

| Risk | Question | Current status |
|---|---|---|
| **Value risk** | Will procurement teams actually use this? Does it solve a real problem? | High — the manual process is assumed to be painful, not observed |
| **Usability risk** | Can officers use it and trust its output? | Medium — the trust model is unresolved; review UX is undesigned |
| **Feasibility risk** | Can the AI pipeline extract and validate CRP data reliably? | Unknown for production; out of scope for the prototype |
| **Business viability risk** | Will a government department pay for it? | Out of scope until value and usability are resolved |

The product is currently in value risk territory. Building features before resolving value risk is the build trap.

---

### Avoiding the build trap (Perri, *Escaping the Build Trap*)

- Output: "We built a supplier dashboard"
- Outcome: "An officer completed a CRP assessment without reading the document themselves and felt confident in the result"

Every addition to the product should be evaluated against the outcome, not the feature list.

---

### Mapping opportunities before solutions (Torres, *Continuous Discovery Habits*)

```
Desired outcome
└── Opportunity (unmet need or pain point)
    └── Solution options (not yet chosen)
        └── Assumptions underlying each option (to be tested)
```

None of the unknowns should be resolved by building — they should be resolved by talking to users or buyers first.

---

### Good services (Downe, *Good Services*)

- **Principle 2 — Clearly explain its purpose:** No moment in the current prototype tells a first-time user what this tool is for
- **Principle 5 — Work in a way familiar to users:** Pipeline stages (semantic, persistence, extraction) are implementation concepts. Officers think in terms of suppliers and tenders.
- **Principle 7 — Require no understanding of government structure:** If officers need to understand PPN 006 numbering to use it, it has failed this principle
- **Principle 8 — Require the minimum possible steps:** Confirming every AI finding one-by-one adds no value over auto-accepting high-confidence results
- **Principle 14 — Make it easy to get human assistance:** No escalation path exists in the current prototype

---

### Jobs to Be Done (Christensen, *Competing Against Luck*)

**The job:** *When I receive a list of bidders for a major contract, help me satisfy myself that each supplier's CRP meets PPN 006 requirements, so I can proceed with the procurement without compliance risk.*

**What they're currently hiring:** A printed criteria checklist, the CRP document, their own reading, and probably a shared spreadsheet or Word template. The competition is the manual process, not another tool.

**The four forces** (Moesta, *Demand-Side Sales 101*):

| Force | Direction | Implication |
|---|---|---|
| Push — frustration with current process | Toward the tool | Only relevant if the manual process is actually frustrating — assumed, not confirmed |
| Pull — the tool is faster and more defensible | Toward the tool | Only works if officers trust the output — unresolved |
| Anxiety — "can I trust an AI determination?" | Away from the tool | The biggest adoption risk; the review UX must address this directly |
| Habit — "I know how to do this manually" | Away from the tool | An officer who is confident in their current process has low motivation to change |

The product's primary adoption problem is anxiety and habit, not awareness.

---

### Wardley Mapping (Wardley, *Wardley Maps*)

| Component | Current stage | Implication |
|---|---|---|
| PPN 006 criteria definitions | Commodity — government publishes them | Don't build infrastructure around this; consume it |
| Document fetching (given a URL) | Product — solved problem in general; novel for CRP discovery | Reasonable to build, but not defensible as a differentiator long-term |
| NLP extraction from unstructured documents | Custom — general capability exists; domain-specific application is novel | Core investment area |
| Cross-referencing SBTi, UKAS | Product — registers exist; querying them is solved; integrating into a workflow is not | Worth building; relatively low risk |
| Officer review and confirmation workflow | Genesis — no established pattern for AI-assisted compliance review | Highest-uncertainty design problem |
| Audit trail and decision record | Custom — no standard exists for this specific use case | Must define the standard; don't copy from adjacent domains without checking fit |

The genuinely novel parts of this product are the extraction quality and the trust/review model.

---

### Good Strategy / Bad Strategy (Rumelt, *Good Strategy Bad Strategy*)

**Diagnosis (assumed):** Procurement teams cannot reliably verify CRP compliance because: (1) the manual process is too slow and subjective to scale, and (2) there is no practical way to cross-reference self-reported claims.

**Guiding policy:** Automate the extraction and structuring of CRP data against PPN 006 criteria. Keep officers in the decision loop for low-confidence determinations. Make every determination reconstructable and attributable.

**Bad strategy warning:** Features that don't flow from the guiding policy are noise.

---

### Crossing the Chasm (Moore, *Crossing the Chasm*)

A good beachhead segment has:
- High volume of tenders above the £5m PPN 006 threshold
- A current CRP checking process that is visibly painful
- Enough technical sophistication to adopt a new tool without extensive hand-holding
- Enough organisational influence that a success here is referenced by other departments

**Assumed likely candidates:** HMRC, Home Office, NHS England, Cabinet Office, MHCLG. Unknown which has the most acute pain.

**Chasm risk:** Early adopters (willing to try new tools) have different needs from the early majority (need proven, low-risk tools). In government, risk aversion increases sharply as you move toward mainstream adoption.

---

## Post-MVP Prioritisation (2026-04-14)

Completed a four-framework prioritisation exercise (Torres, Cutler, Rumelt, Cagan) across six post-MVP opportunities.

**Context corrections established during this exercise:**
- Consistency between officers is **not** a significant problem — PPN 006 criteria are largely binary (data point present or absent), not interpretive
- Primary value proposition is **capability** (AI extraction itself) and **defensibility** (audit trail), not speed
- Real AI extraction is already being built by the dev team and will exist before the post-MVP phase
- This prototype is for exploring possibilities, not production deployment — commercial viability frameworks (Moore/beachhead) do not apply at this stage

---

### Priority stack

**Priority 0 — Audit standard research** *(desk research, before anything else)*

What does "audit-ready" actually mean to a buyer organisation? The assumed definition (per-criterion log with extracted text, determination, officer response) may not match what buyers legally or operationally require. If auditors must still read source documents themselves, the AI-assistance model may be invalid.

- Action: Desk research — NAO reports, procurement guidance, FOI responses, adjacent practitioners
- Gate: Resolve before designing the audit feature set

**Priority 1 — Auto-discovery**

Given a company name or tender, the tool finds and fetches the CRP automatically. Scope the vision; dev team assesses feasibility separately.

- Risk: Feasibility unknown — document locations vary wildly, no standard URL pattern
- Action: Scope the vision first; do not commit to architecture before feasibility is assessed

**Priority 2 — Audit feature set definition**

Before exportable output makes sense, the audit feature set must be defined. Export is only meaningful once the per-criterion data model and officer review workflow are established.

- Depends on: Priority 0 (audit standard research)
- Output: A defined per-criterion data model and officer review workflow

**Priority 3 — Formal exportable output**

A report or export that makes the determination record portable — attachable to a procurement record, shareable with an audit function.

- Depends on: Priority 2 (audit feature set definition)

**Deprioritised — Claim cross-referencing**

Cross-referencing self-reported certifications (SBTi, UKAS) against public registers. Understand more before committing; deprioritised for now.

---

### Opportunities requiring validation before building

**C — Tender workflow**

Unknown how officers actually work — one supplier at a time, or a full list per tender. PPN 006 applies to all suppliers above £5m on a tender, so batch checking is plausible and potentially high-value. Treat as a research question; scope the vision once the workflow is understood.

**E — Longitudinal monitoring**

PPN 006 requires annual CRP re-publication. Suppliers on framework agreements or repeat contracts would realistically need re-assessment. The operational expectation of re-checking likely exists; no tooling currently supports it. Worth including in the product vision — lower urgency, but not speculative.

---

### Deferred

**D — Platform integration:** No stakeholder or dev team has named this as a direction. Purely theoretical. Do not scope or build.

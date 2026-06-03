---
id: TA-{SCOPE}                                 # TA-{DOMAIN-CODE} for domain level (e.g. TA-FM); TA-CAP-{NNN} for capability level (e.g. TA-CAP-007)
level: domain                                  # domain | sub-domain | capability  (architectural altitude, NOT org structure)
scope: FM                                      # domain: a short domain code (FM, TAX, TREASURY). capability/sub-domain: a CAP-{NNN} from the capability map.
parent: null                                   # domain level: null. sub-domain/capability level: the parent TA id (e.g. TA-FM). MUST name an existing TA.
status: authoritative                          # draft (being converted, not yet a guardrail) | authoritative (loaded as guardrail) | superseded
source_diagram: {ref}                          # provenance — path/filename/link of the diagram this was converted from (e.g. fm-target-state.drawio, vision/diagrams/fm.png)
owner: {lead architect name}                   # architect-owned; read-only to Jupiter once authoritative (see GUIDE §6)
last_updated: YYYY-MM-DD
---

# Target Architecture: {name}

<!--
This file is AUTHORITATIVE CONTEXT (a guardrail), not a Jupiter-produced artifact.
It lives under workspace/context/target-architecture/ and is loaded on every
iteration of every transformation phase. Downstream work (PS strawmans, OQ
resolutions, ADRs, the SOAP) is checked for alignment against it.

Altitude rule: the MOST SPECIFIC applicable target governs. A capability-level
target refines its parent domain target — it may add detail but MUST NOT
contradict the parent. See templates/target-architecture_GUIDE.md.

Frontmatter above is machine-parseable. To author or update this file, convert
from a diagram per the GUIDE — do not free-type architecture into it.
-->

---

## 1. Scope & Altitude

*What this target governs, and why it sits at this grain.*

[REPLACE WITH 1–2 sentences: what part of the architecture this file is the authoritative target for. For a capability-level file, name the CAP and how it refines the parent domain target — e.g. "Authoritative target for CAP-007 e-Invoicing; refines TA-FM's downstream-posting block with the e-invoicing-specific clearance flow."]

---

## 2. Conceptual Overview

*The target state in narrative form — what it is and what it is meant to achieve. Conceptual: describe capabilities and responsibilities, not products, unless the target genuinely commits to one (then record it as a constraint in §5).*

[REPLACE WITH 1–3 paragraphs.]

---

## 3. Building Blocks

*One row per box in the diagram. Conceptual building blocks — a responsibility, not an implementation. Bind each to a capability-map entry where one exists; that binding is what keeps this guardrail anchored to the rest of Jupiter.*

| Block            | Responsibility (1 line)            | Maps to CAP | Notes                            |
|------------------|------------------------------------|-------------|----------------------------------|
| [Block name]     | [What it is responsible for]       | CAP-{NNN}   | [or "— (no CAP; conceptual only)"] |

---

## 4. Relationships & Flows

*One row per arrow in the diagram. What moves between blocks and in which direction. This is where data hand-offs and upstream/downstream dependencies become explicit.*

| From         | To           | What flows / dependency           | Notes                          |
|--------------|--------------|-----------------------------------|--------------------------------|
| [Block A]    | [Block B]    | [e.g. posted journals, trade events] | [e.g. via DPD-001 once defined] |

---

## 5. Architecture Principles & Constraints

*The rules this target imposes. THESE are what downstream alignment checks test against — keep each one a checkable statement, not a platitude. Number them so PS / ADRs / SOAP can cite them. Include any product/technology commitment the target genuinely makes (record it here rather than burying it in narrative).*

| Key            | Principle / Constraint                                              |
|----------------|--------------------------------------------------------------------|
| TA-{SCOPE}-P1  | [REPLACE — e.g. "Tax determination is centralised; no domain computes tax independently."] |
| TA-{SCOPE}-P2  | [REPLACE — e.g. "All inbound trade data is consumed via a governed data product, never point-to-point."] |

---

## 6. Boundaries & Interfaces

*What is in and out of this target's scope, and the integration points across the boundary (especially upstream producers and downstream consumers).*

- **In scope:** [REPLACE]
- **Out of scope:** [REPLACE — reference the owning TA or initiative if owned elsewhere]
- **Interfaces / integration points:** [REPLACE — upstream sources, downstream consumers, cross-domain hand-offs]

---

## 7. Diagram

*The source picture, embedded (Mermaid) or referenced (image path in `source_diagram`). Keep the file and the diagram in sync — when the diagram changes, re-convert (GUIDE §6).*

```mermaid
flowchart LR
  A[Block A] --> B[Block B]
```

[REPLACE WITH the converted diagram, or "See source_diagram: {ref}".]

---

## 8. Assumptions

*Assumptions baked into this target state. These are NOT Open Questions — OQs belong to Problem Spaces. These are positions the target takes that may later be revisited.*

- [REPLACE WITH assumptions, or "None recorded."]

---

## 9. Refinements

*The altitude links, made explicit.*

- **Domain / sub-domain files:** list the child TAs that refine this one — e.g. "TA-CAP-007 (e-Invoicing) refines block 'Downstream Posting'."
- **Capability files:** confirm the `parent` named in frontmatter and state which parent block(s) this file refines.

[REPLACE, or "None — leaf target." for a capability file with no children.]

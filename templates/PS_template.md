---
id: PS-{SLUG}                                  # e.g. PS-DIRECT-TAX, PS-GL-LEDGER-FLOW
name: {Human-readable name}                    # e.g. Direct Tax
derived_from:                                  # what Vision artifact + gap motivated this PS
  artifact: vision/capability-map.md           # or vision/conceptual-sketch.md, etc.
  source: CAP-002                              # capability ID, component ID, or other ref
  gap: {1-sentence description of the gap}     # e.g. "Realisation approach unclear — jurisdictional MTM/settlement variance not modelled"
status: open                                   # open | in-progress | converging | closed
domain: {DOMAIN}                               # OPTIONAL — single domain tag, e.g. TAX
# domains: [FIN, TAX]                          # use INSTEAD of `domain` if PS genuinely spans multiple
architect_lead: {name}                         # single lead architect
supporting_architects:                         # optional, multiple
  - { name: {name}, domain: {DOMAIN} }
stakeholders:
  business_smes:
    - { name: {name}, role: {title} }
  tech:
    - { name: {name}, role: {title} }
  sponsor: {name}                              # optional
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
---

# Problem Space: {name}

<!-- Frontmatter above is machine-parseable by the loop agent. Update all fields as the PS evolves. -->

---

## 1. Problem Statement

*What we don't yet understand well enough to design for. The gap in understanding this PS exists to close.*

[REPLACE WITH a 1–3 sentence statement of the problem this PS addresses. Be specific about what is *not yet known* — this is what the inquiry will resolve. A problem space is an area of inquiry, not a solution statement.]

---

## 2. Scope & Boundaries

*What this PS investigates, and the explicit edges that keep it from drifting into adjacent territory.*

**In scope**

[REPLACE WITH what this PS investigates — a bulleted list of in-scope topics, systems, or processes is fine.]

**Out of scope**

[REPLACE WITH explicit boundaries — what is NOT in this PS even if related. Prevents drift into adjacent territory. If something related is owned by another PS, reference it by key — e.g. "Deferred tax provision — owned by PS-DEFERRED-TAX."]

---

## 3. Problem Analysis

*The analysis of what makes THIS problem hard. Adaptive by design: carry only the focus areas this specific problem turns on. A data-ownership conflict, a process gap, a capability void, and a regulatory seam are different problems and warrant different analysis — not a fixed section set.*

<!--
ADAPTIVE ZONE. Choose the 2–4 focus areas this problem actually turns on.
Each focus area is a ### sub-heading YOU pick, carrying real analysis
(a table, a Mermaid diagram, prose — whatever the dimension needs).

  - Fit, don't fill. Do NOT complete a fixed set of headings; choose what
    fits, invent what the menu lacks, and OMIT any dimension this problem
    does not have.
  - Analyse, don't recap. Do NOT restate §1 (problem) or §2 (scope) here.
  - A PS whose §3 sub-headings match every other PS's has not been
    analysed — it has been filled in (AI-PROBE-011).
  - §3 is guarded like every other structured layer: each focus area's
    content traces to authoritative context or a notes-file session
    (AI-PROBE-006). Free-form is not a licence for ungrounded prose.

Example lenses (illustrative, NOT a checklist):
  authority / ownership map · current-vs-target flow · stakeholder tension ·
  build / buy / partner · constraint & regulatory analysis · data lineage ·
  failure modes & bottlenecks · cost / impact · dependency seam
-->

### [REPLACE WITH a focus area this problem turns on]

[REPLACE WITH the analysis for that dimension.]

### [REPLACE WITH a second focus area this problem demands]

[REPLACE WITH the analysis.]

---

## 4. Strawman (current solution hypothesis)

*The current best guess at the SOLUTION shape within this PS — nothing else. The loop agent drafts it at PS open and proposes refinements as OQs resolve and notes evidence accumulates — each change traced to context or evidence (per AI-PROBE-006); the architect approves all changes. 4.2/4.3 are the structured anchors the gap-probe loop reads and the living SOAP promotes (4.2 → SOAP §6, 4.3 → SOAP §7); 4.4 surfaces cross-PS / cross-DPD dependencies.*

<!-- Reference §1/§2/§3 by their content — do NOT restate the problem, scope, or
     analysis here. If a sub-section has nothing yet, leave it empty; don't pad. -->

### 4.1 Shape

[One Mermaid diagram of the current solution shape, when there is one to draw. Optionally ONE line stating the current position — the thesis, not a recap. e.g. "Current position: settlement handled centrally by the tax engine; the open bet is jurisdictional MTM variance (OQ-DIRECT-TAX-002)." NOT a recap of §1/§2/§3.]

### 4.2 Components

| Name | Brief description |
|------|-------------------|
|      |                   |

### 4.3 Decisions

| Decision | Position taken |
|----------|----------------|
|          |                |

### 4.4 Open dependencies

| Depends on              | Status                  |
|-------------------------|-------------------------|
| PS-{SLUG} or DPD-{NNN}  | open / aligned / closed |

---

## 5. Open Questions

*Each question represents a discrete unknown that must be resolved before this PS can converge. Questions resolve by **producing** one or more downstream artifacts (REQ / ADR / context update) or by being captured as knowledge only.*

| OQ Key | Question / Why | Status | Assigned | Refs | Resolution |
|---------------|---------------------------------------------------------------------------------------------------|---------------|----------|------------|---------------------------------------|
| OQ-{SLUG}-001 | [REPLACE WITH question]?<br>_[REPLACE WITH 1-sentence rationale: architectural/process implication]_ | open | [name] | — | — |
| OQ-{SLUG}-002 | [REPLACE WITH question]?<br>_[REPLACE WITH rationale]_ | in-discussion | [name] | ADR-{NNN}-{slug} (proposed), PS-{OTHER} | — |
| OQ-{SLUG}-003 | [REPLACE WITH question]?<br>_[REPLACE WITH rationale]_ | resolved | [name] | — | → REQ-{TYPE}-{DOMAIN}-{SEQ} |

**Status values:** `open` | `in-discussion` | `resolved` | `deferred` | `rejected`

**Decision-shaped OQs anchor on a Proposed ADR.** When an OQ is recognised as needing an architecture decision (it selects a technology or pattern, resolves a trade-off with long-term consequences, or constrains future options — the same significance test as the design profile), the ADR is drafted **immediately at status `Proposed`** from `templates/ADR_template.md`, with all authoritative context and guardrails loaded — not written at resolution as an after-the-fact record. The Proposed ADR is the **discussion anchor**: it carries the context, alternatives, and trade-offs stakeholders need to review and judge the decision (ARB-style). Reference it in the Refs column while the OQ is `in-discussion`.

**Resolution outcomes** *(when status = `resolved`, the OQ **produces** one or more of):*

- `→ REQ-{TYPE}-{DOMAIN}-{SEQ}` — crystallised into a requirement. The REQ is *created* at the moment of resolution.
- `→ ADR-{NNN}-{slug}` — the decision is made and captured in the anchoring ADR (drafted at `Proposed` when the OQ entered `in-discussion` — see above). Resolution records that the decision was made; ratification (`Proposed` → `Accepted`) is the architect's explicit act, in-phase or at latest at the Converge gate.
- `→ DPD-{NNN}` — contributed to a Data Product Definition (joint discovery with upstream producer).
- `→ context: {path}` — updated context (glossary / landscape / data product spec).
- `→ knowledge` — answer captured in notes only; no downstream artifact needed.

**Other terminal states:**

- `deferred to: {next-phase | PS-OTHER}` — when status = `deferred`.
- `rejected: {reason}` — when status = `rejected`.

---

## 6. Activity Log

*Anything that advanced understanding in this PS — workshops, document reviews, async resolutions, SME interviews, spike results. Each entry records what was closed and what was raised.*

| Date | Mode | Closed | Raised | Notes |
|------------|---------------|------------------------------|---------------------|-----------------------------|
| YYYY-MM-DD | workshop | OQ-{SLUG}-003, OQ-{SLUG}-005 | OQ-{SLUG}-008 | [REPLACE WITH brief note] |
| YYYY-MM-DD | async-review | OQ-{SLUG}-007 | — | [REPLACE WITH brief note] |
| YYYY-MM-DD | sme-interview | OQ-{SLUG}-004 | OQ-{SLUG}-009 | [REPLACE WITH brief note] |

**Mode values:** `workshop` | `async-review` | `sme-interview` | `doc-analysis` | `spike` | `other`

---

## 7. Notes Reference

*Raw inquiry notes (SME discussions, document reviews, async resolutions) live in a separate file, organised chronologically by session. This PS file contains only the **structured layer** — problem analysis, strawman, OQs with resolutions, derived_from. Raw evidence is captured by the architect; the loop agent reads notes + context and proposes structured updates here for architect approval. The raw-vs-structured separation enforces Jupiter's context-driven output principle.*

**Notes file:** `workspace/artifacts/transformation/notes/PS-{SLUG}-notes.md`

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

## 2. Scope

*What this PS investigates — the area of inquiry.*

[REPLACE WITH a clear statement of what is in scope. Bulleted list of in-scope topics, systems, or processes is fine.]

---

## 3. Out of Scope

*Explicit boundaries — what is NOT in this PS even if related. Prevents drift into adjacent territory.*

[REPLACE WITH explicit out-of-scope items. If something related is owned by another PS, reference it — e.g. "Deferred tax provision — owned by PS-DEFERRED-TAX."]

---

## 4. Strawman (Current Understanding)

*The architect's current working hypothesis for the solution within this PS. Loop agent proposes the initial draft at PS open and proposes updates as OQs resolve and notes evidence accumulates — each change traced to context or evidence (per AI-PROBE-006); the architect approves all changes. 4.1 carries the picture; 4.2/4.3 are structured anchors for the gap-probe loop; 4.4 surfaces cross-PS / cross-DPD dependencies.*

### 4.1 Narrative

[Free-form narrative + Mermaid diagram. Current understanding of the solution shape for this PS. Updated as inquiry progresses.]

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
| OQ-{SLUG}-002 | [REPLACE WITH question]?<br>_[REPLACE WITH rationale]_ | in-discussion | [name] | PS-{OTHER} | — |
| OQ-{SLUG}-003 | [REPLACE WITH question]?<br>_[REPLACE WITH rationale]_ | resolved | [name] | — | → REQ-{TYPE}-{DOMAIN}-{SEQ} |

**Status values:** `open` | `in-discussion` | `resolved` | `deferred` | `rejected`

**Resolution outcomes** *(when status = `resolved`, the OQ **produces** one or more of):*

- `→ REQ-{TYPE}-{DOMAIN}-{SEQ}` — crystallised into a requirement. The REQ is *created* at the moment of resolution.
- `→ ADR-{NNN}-{slug}` — crystallised into an architecture decision.
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

*Raw inquiry notes (SME discussions, document reviews, async resolutions) live in a separate file, organised chronologically by session. This PS file contains only the **structured layer** — strawman, OQs with resolutions, derived_from. Raw evidence is captured by the architect; the loop agent reads notes + context and proposes structured updates here for architect approval. The raw-vs-structured separation enforces Jupiter's context-driven output principle.*

**Notes file:** `workspace/artifacts/transformation/notes/PS-{SLUG}-notes.md`

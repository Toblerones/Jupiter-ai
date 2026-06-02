---
id: DPD-{NNN}                                  # e.g. DPD-001
name: {Data Product Name}                      # e.g. Trade Capture Data Product
status: discovering                            # discovering | drafting | aligned | implemented
sources:                                       # multi-source — accumulates from Vision and PSs
  - { from: vision/capability-map.md, capability: CAP-{NNN} }
  - { from: PS-{SLUG}, oq: OQ-{SLUG}-{NNN} }
producer:
  team: {upstream team / domain}
  owner: {individual or role}
consumers:
  - {this initiative}
  - {other consumers if known}
relates_to:                                    # only if EVOLVING an existing data product
  existing: context/data-products/{path}
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
---

# DPD-{NNN}: {Name}

<!-- Frontmatter above is machine-parseable. Update as the DPD evolves. -->

---

## 1. Purpose

*What this data product enables. Why both sides — consumer and producer — care.*

[REPLACE WITH a 1–3 sentence statement of what the data product enables. Anchor to architectural / business value, not implementation detail.]

---

## 2. Discovery Sessions

*Collaborative sessions with the upstream producer. Like PS notes, scoped to this DPD. Raw session content lives in the DPD notes file; this section summarises outcomes for navigation.*

| Date       | Mode             | Attendees (both sides)              | Outcomes (brief)                          |
|------------|------------------|-------------------------------------|-------------------------------------------|
| YYYY-MM-DD | initial-design   | Architect only                      | Hypothesis captured for producer review   |
| YYYY-MM-DD | workshop         | Consumer + Producer SMEs            | Field set draft 1 agreed                  |
| YYYY-MM-DD | async-review     | Producer reviewer name              | SLA constraints accepted                  |

*Raw session content: `workspace/artifacts/transformation/notes/DPD-{NNN}-notes.md`*

---

## 3. Current Draft Specification

*Joint working spec, evolved through discovery sessions. The loop agent updates this section from notes + context cross-check; the architect approves each change. Producer input that contradicts our authoritative context is flagged for reconciliation, not silently accepted.*

### 3.1 Schema / Fields

[REPLACE WITH field-by-field schema as agreed so far. Include name, type, semantics, nullability, source system.]

### 3.2 Events / Update Semantics

[REPLACE WITH event types, update frequency, change semantics (event-sourced vs snapshot-overwrite, etc.).]

### 3.3 SLA

*Latency, freshness, availability targets — quantified where possible.*

[REPLACE WITH specific targets, e.g. "p99 latency < 1s; availability ≥ 99.9% monthly; freshness ≤ 5 minutes from source event."]

### 3.4 Governance

*Classification, ownership, lifecycle policy, retention.*

[REPLACE WITH data classification (public / internal / restricted / confidential), ownership team, retention policy, applicable regulatory context.]

### 3.5 Sharing Channels

*How consumers access the data product — API, event stream, file, lakehouse, etc.*

[REPLACE WITH access channel(s), endpoint references, schema registry references, authentication model.]

---

## 4. Open Questions

*Remaining unknowns before this DPD can reach `aligned`. Scoped to this DPD; broader architectural inquiry happens in PS.*

| OQ Key            | Question / Why                                                                  | Status        | Resolution                |
|-------------------|---------------------------------------------------------------------------------|---------------|---------------------------|
| OQ-DPD-{NNN}-001  | [Question]?<br>_[Why this matters for the data product]_                        | open          | —                         |
| OQ-DPD-{NNN}-002  | [Question]?<br>_[Why]_                                                          | resolved      | → context: glossary/{...} |

**Status values:** `open` | `in-discussion` | `resolved` | `deferred` | `rejected`

---

## 5. Alignment Log

*Sign-off moments — when one side commits to a specific aspect of the spec.*

| Date       | Aspect                | Committed by           | Note                                       |
|------------|-----------------------|------------------------|--------------------------------------------|
| YYYY-MM-DD | Schema (Section 3.1)  | Producer (name)        | Producer commits to fields in draft 3      |
| YYYY-MM-DD | SLA (Section 3.3)     | Consumer (architect)   | Consumer accepts 5-min latency             |

---

## 6. Acceptance Criteria for `implemented`

*Testable conditions for moving from `aligned` to `implemented`.*

[REPLACE WITH specific testable criteria. e.g. "Tax classification field present on all trade messages from 2026-Q3, validated by integration test" or "Real-time position event stream available with sub-second latency under 1000 evt/s load."]

# Capability Map: {Initiative Name}

| Field        | Value                                |
|--------------|--------------------------------------|
| Initiative   | [REPLACE WITH initiative-id]         |
| Created      | YYYY-MM-DD                           |
| Last Updated | YYYY-MM-DD                           |
| Architect    | [REPLACE WITH lead architect name]   |

---

## 1. Overview

*Narrative description of the capability landscape — what business capabilities are in scope for this transformation and how they connect at a high level.*

[REPLACE WITH 1–3 paragraphs describing the capability landscape in scope.]

---

## 2. Capability Diagram (optional)

*Mermaid diagram showing capability flow / dependencies. Helps see the shape at a glance.*

```mermaid
flowchart LR
  CAP-001[Trade Capture] --> CAP-002[Tax Calculation]
  CAP-002 --> CAP-003[GL Posting]
```

[REPLACE WITH a diagram appropriate to the initiative, or omit if not useful.]

---

## 3. Capabilities

*Structured list of in-scope business capabilities. The Clarity flag drives Problem Space proposal at the Vision → Probe transition.*

| ID      | Capability         | Owner       | Current State              | Target State                    | Clarity  | Notes                              |
|---------|--------------------|-------------|----------------------------|---------------------------------|----------|------------------------------------|
| CAP-001 | [Capability name]  | [Owner]     | [1-line current state]     | [1-line target state]           | clear    | [Notes if any]                     |
| CAP-002 | [Capability name]  | [Owner]     | [1-line current state]     | [1-line target state]           | unclear  | [Notes on what's unclear / open]   |
| CAP-003 | [Capability name]  | [Owner]     | [1-line current state]     | [1-line target state]           | unknown  | [Notes on what's not yet defined]  |

**Clarity values:**
- `clear` — both target and realisation are well-understood
- `unclear` — target known, but realisation / data / process flow unclear
- `unknown` — target itself not yet defined

*Capabilities with `clarity = unclear` or `unknown` are the **primary source of Problem Space candidates**. The loop agent analyses these at the Vision → Probe transition and proposes PS, with each PS's `derived_from:` field referencing the source capability.*

---

## 4. Out of Scope Capabilities

*Related capabilities NOT part of this transformation initiative. Prevents drift.*

| Capability     | Reason out of scope                                        |
|----------------|------------------------------------------------------------|
| [Name]         | [e.g. owned by separate initiative, or downstream concern] |

[REPLACE WITH the actual out-of-scope list, or "None — all related capabilities are in scope."]

# Jupiter

An AI-assisted architecture governance engine. Jupiter helps architects deliver structured, traceable architecture work — from problem statement through requirements to a ratified Solution Architecture Document (SAD).

Jupiter runs on Claude Code. Every phase of the architecture workflow is governed by gate checks. Human approval is required at every phase transition. The architect stays in control.

---

## What Jupiter does

Jupiter manages one architecture initiative at a time through three phases:

```
Intent  →  Requirements  →  Design (SAD + ADRs)
```

At each phase, the loop agent:
1. Reads the intent or previous artifact
2. Produces or refines the current artifact
3. Runs gate checks (auto checks and AI checks)
4. Reports the gap — how many required checks are still failing
5. When gap = 0, waits for architect approval before advancing

The architect drives every phase transition. Jupiter does the structured work.

---

## Quick start

```bash
# 1. Initialise a workspace
/jupiter:init --project my-initiative

# 2. Edit workspace/INTENT.md with the problem statement

# 3. Iterate — Jupiter produces requirements from the intent
/jupiter:iterate

# 4. Run again if gate checks are still failing
/jupiter:iterate

# 5. Review — approve, reject, or request refinement
/jupiter:review

# 6. Continue through design
/jupiter:iterate   # produces Solution Component Map
/jupiter:review    # architect approves the component map
/jupiter:iterate   # produces SAD + ADRs
/jupiter:review --panel  # reviewer panel + architect approval

# 7. Check traceability
/jupiter:gaps

# 8. Generate handoff package
/jupiter:handoff --version 1.0.0
```

---

## Commands

| Command | What it does |
|---------|-------------|
| `/jupiter:init` | Scaffold workspace, guided project setup, create first initiative |
| `/jupiter:iterate` | Run one loop iteration — produce or refine the current phase artifact + gate report |
| `/jupiter:status` | Show phase progress, current gate check status, pending escalations, next action |
| `/jupiter:review` | Record human gate decision (approve / reject / refine) |
| `/jupiter:review --panel` | Invoke 5 reviewer agents, then record human gate decision |
| `/jupiter:review --spec` | Spec boundary check (requirements are tech-agnostic?), then gate decision |
| `/jupiter:spawn --type discovery\|spike\|poc` | Create a time-boxed child initiative |
| `/jupiter:gaps` | REQ key coverage check across requirements and design artifacts |
| `/jupiter:handoff` | Readiness check + handoff manifest |
| `/jupiter:assess --artifact <path>` | Evaluate an externally-produced artifact |

---

## Gate checks

Each phase has three types of gate checks defined in `workflow/gates/`:

- **Auto checks** — deterministic: artifact structure, key format, placeholder text, required fields
- **AI checks** — judgment: coherence, consistency, business framing, constraint compliance
- **Human gate** — architect sign-off via `/jupiter:review`

Gap = count of required checks failing. Phase is ready for human review when gap = 0 on auto and AI checks. Phase is complete when the architect approves via `/jupiter:review`.

---

## Reviewer panel

`/jupiter:review --panel` invokes five domain reviewer agents, one after another. Each produces a structured assessment report from their perspective:

- **Enterprise Architect** — strategic fit, enterprise standards, portfolio impact
- **Business Architect** — business capability coverage, stakeholder needs, regulatory alignment
- **Data Architect** — data model quality, governance, integration integrity
- **Solution Architect** — technical soundness, design quality, NFR coverage
- **Engineering Lead** — delivery feasibility, delivery risk, tech debt

After reading all five reports, the architect makes the approval decision. The panel is advisory — the architect decides.

---

## Profiles

| Profile | Phases | Use when |
|---------|--------|---------|
| `architecture` | Intent → Requirements → Design | Standard architecture governance work |
| `assessment` | Assessment only | Evaluating an externally-produced artifact |
| `discovery` | Intent (exploration variant, 3-iteration budget) | Problem space is not well understood yet |
| `spike` | Intent (investigation variant, 2-iteration budget) | Answering a specific technical question |

Spawn child initiatives for discovery and spike work:
```bash
/jupiter:spawn --type spike --question "Can we achieve sub-100ms latency with event sourcing?"
/jupiter:spawn --type discovery --reason "Understand the integration landscape before writing intent"
```

---

## Workspace layout

```
workspace/
  INTENT.md                        ← edit before first /jupiter:iterate
  log.jsonl                        ← append-only activity log (source of truth)
  context/
    project.yml                    ← project identity and constraints
    policy/                        ← regulatory documents (loaded as guardrails)
    standards/                     ← architecture standards
    landscape/                     ← integration landscape constraints
    adrs/                          ← prior ADRs as guardrails
    glossary/                      ← domain vocabulary
  initiatives/{id}.yml             ← machine-readable initiative state
  artifacts/
    requirements/{id}-requirements.md
    design/{id}-SAD.md
    design/adrs/ADR-{NNN}-{slug}.md
  assessment/inbox/                ← drop externally-produced artifacts here
```

---

## Key formats

**Requirements**: `REQ-{TYPE}-{DOMAIN}-{SEQ}`
- TYPE: `F` (Functional), `NFR` (Non-Functional), `BR` (Business Rule), `C` (Compliance), `S` (Security)
- DOMAIN: 2–5 uppercase letters (e.g. PROC, AUTH, RPT)
- SEQ: 3-digit zero-padded (001, 002, ...)
- Keys are immutable once assigned

**Components**: `COMP-{NNN}` — assigned during design phase

**ADRs**: `ADR-{NNN}-{slug}.md` — status: Proposed → Accepted or Superseded

---

## SDK and web frontend readiness

Jupiter's design supports future SDK integration and web frontend rendering without architectural changes:

- `workflow/gates/*.yml` and `workflow/stages.yml` — machine-readable behavior config; an SDK agent reads the same YAML as Claude Code
- `workspace/initiatives/{id}.yml` — machine-readable initiative state; maps directly to UI status components
- `workspace/log.jsonl` — 7 stable event types; tail for real-time feeds
- `workspace/artifacts/` — markdown content; renderable directly
- `workspace/context/project.yml` — project identity and constraints

A web backend trigger calls the Claude API with `agents/loop.md` as the system prompt and loads context from `workflow/` and `workspace/` exactly as Claude Code does. No Jupiter-specific SDK code needed.

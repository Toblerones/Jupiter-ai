# Jupiter

An AI-assisted architecture governance engine. Jupiter helps architects deliver structured, traceable architecture work — from problem statement through requirements to a ratified Solution On A Page (SOAP).

Jupiter runs on Claude Code. Every phase of the architecture workflow is governed by gate checks. Human approval is required at every phase transition. The architect stays in control.

---

## What Jupiter does

Jupiter manages one architecture initiative at a time through three phases:

```
Intent  →  Requirements  →  Design (SOAP + ADRs)
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
# 1. Launch the primary entry point — Jupiter detects state and routes automatically
/jupiter:start
```

On first run, `/jupiter:start` presents a menu:

```
Welcome to Jupiter. What would you like to do?

  1. Start a new architecture initiative
  2. Continue existing work
  3. Quick spike or discovery
  4. Assess an existing artifact
  5. Import existing requirements

Enter 1, 2, 3, 4, or 5 (or press Enter for 1):
```

Option 1 walks through project identity questions, captures a one- or two-sentence intent seed, and runs the first intent iteration. No manual file editing required.

On subsequent runs, `/jupiter:start` detects the current phase and routes to the right next action automatically.

```bash
# Iterate until gap = 0
/jupiter:iterate

# Approve, reject, or request refinement
/jupiter:review

# Continue through design
/jupiter:iterate   # produces SOAP + ADRs
/jupiter:review --panel  # reviewer panel + architect approval

# Check traceability
/jupiter:gaps

# Generate handoff package
/jupiter:handoff --version 1.0.0
```

---

## Commands

| Command | What it does |
|---------|-------------|
| `/jupiter:start` | **Primary entry point** — first run bootstraps workspace + captures intent seed + runs first iteration; subsequent runs detect state and route automatically |
| `/jupiter:init` | Scaffold workspace only (called by `/jupiter:start` on first run; direct use is for programmatic setup) |
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
| `requirements-first` | Requirements → Design (intent derived automatically) | Business has provided an existing BRD, user story set, or requirements doc |
| `assessment` | Assessment only | Evaluating an externally-produced artifact |
| `discovery` | Intent (exploration variant, 3-iteration budget) | Problem space is not well understood yet |
| `spike` | Intent (investigation variant, 2-iteration budget) | Answering a specific technical question |

Spawn child initiatives for discovery and spike work:
```bash
/jupiter:spawn --type spike --question "Can we achieve sub-100ms latency with event sourcing?"
/jupiter:spawn --type discovery --reason "Understand the integration landscape before writing intent"
```

### Requirements-first import

Select **Option 5** in the `/jupiter:start` menu when the business has already produced a requirements document. Jupiter reads the raw document, derives an intent statement, normalises requirements to Jupiter REQ format, and runs gate checks to surface gaps. The document can be a local file path or a Confluence page URL — Jupiter fetches Confluence pages automatically.

### Assessing an existing artifact

Select **Option 4** in the `/jupiter:start` menu (or run `/jupiter:assess --artifact <path>`) to evaluate a SOAP, requirements doc, or ADR against project constraints. As with requirements-first import, you can provide a local file path or a Confluence page URL.

---

## Workspace layout

```
workspace/
  INTENT.md                        ← intent statement (written by loop agent on first iteration)
  log.jsonl                        ← append-only activity log (source of truth)
  context/
    project.yml                    ← project identity and constraints
    policy/                        ← regulatory documents (loaded as guardrails)
    standards/                     ← architecture standards
    landscape/                     ← integration landscape constraints
    adrs/                          ← prior ADRs as guardrails
    glossary/                      ← domain vocabulary
  initiatives/{id}.yml             ← machine-readable initiative state
  state/
    gate-reports/{id}-{phase}-latest.json  ← latest gate report (overwritten each iteration)
  artifacts/
    requirements/{id}-requirements.md
    design/{id}-SOAP.md
    design/adrs/ADR-{NNN}-{slug}.md
    assessment/
      inbox/                       ← drop externally-produced artifacts here
      {assessment-id}/findings.md  ← assessment findings report
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

## Web dashboard

Jupiter includes a Next.js web dashboard (`web/`) for read-only visibility into initiative state. It renders:

- Phase progress and current gate check status
- Live activity log (`workspace/log.jsonl`)
- Gate reports with auto-check and AI-check breakdowns
- Artifact content (requirements, SOAP, ADRs) via react-markdown

The dashboard is a read-only observer — all writes still go through Claude Code commands. To run it locally:

```bash
cd web && npm install && npm run dev
```

### SDK integration

Jupiter's file formats are stable and machine-readable, making Claude API integration straightforward:

- `workflow/gates/*.yml` and `workflow/stages.yml` — behavior config; an SDK agent reads the same YAML as Claude Code
- `workspace/initiatives/{id}.yml` — machine-readable initiative state
- `workspace/log.jsonl` — 7 stable event types; tail for real-time feeds
- `workspace/state/gate-reports/` — persisted gate report JSON per iteration

A backend trigger calls the Claude API with `agents/loop.md` as the system prompt and loads context from `workflow/` and `workspace/` exactly as Claude Code does.

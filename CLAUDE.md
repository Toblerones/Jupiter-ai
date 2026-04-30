# CLAUDE.md — Jupiter Working Guide

This file tells Claude Code how to work in this directory. It is the authoritative orientation for any Claude Code session operating on Jupiter.

---

## What This Directory Contains

**Jupiter** is an AI-assisted architecture governance engine. It manages architecture delivery work through a three-phase workflow: Intent → Requirements → Design. Each phase is governed by gate checks that must pass before the phase is complete. Human gate approval is required at every phase transition.

Jupiter is accessed through Claude Code slash commands in `.claude/commands/jupiter/`.

---

## Workflow

### Three phases

| Phase | Produces | Human gate required |
|-------|---------|---------------------|
| Intent | `workspace/INTENT.md` — problem statement and desired outcomes | Yes |
| Requirements | `workspace/artifacts/requirements/{id}-requirements.md` — structured, tech-agnostic requirements | Yes |
| Design | `workspace/artifacts/design/{id}-SAD.md` + ADRs | Yes |

### Intent is loop-produced

The intent phase is not a manual authoring step. `/jupiter:start` captures a one or two sentence seed from the architect (the problem statement) and writes it to INTENT.md. The loop agent then reads the seed plus all loaded context (project.yml, policy, landscape, ADRs, glossary) and elaborates the full four-section intent statement. The architect reviews, refines via further iterations if needed, and approves via `/jupiter:review`. Only after that does the requirements phase begin.

This means the architect describes the problem; the loop agent draws out the business context, desired outcomes, and known constraints from what is already known. No blank-template authoring.

### Design runs in two sub-phases

**Phase 1 — Solution Component Map**: map every REQ key to an architecture building block (COMP-NNN). Identify Architecturally Significant Requirements (ASRs) at the component level. Raise design questions. The architect approves the component map (HG-RD-001) via `/jupiter:review` before SAD writing begins.

**Phase 2 — SAD + ADRs**: write the full SAD using the approved component map as §4. Generate ADRs for every significant decision. The architect approves the SAD, ratifies all ADRs, and confirms stakeholder review (HG-RD-002, HG-RD-003, HG-RD-004) via `/jupiter:review --panel`. The design phase is complete only when all four design human gates are approved.

The `phases.design.sub_phase` field in the initiative file (`component_map` or `sad`) tracks which sub-phase the loop agent is producing. The first `/jupiter:review` approval flips `sub_phase` from `component_map` to `sad` and sets HG-RD-001 to `approved`. The second `/jupiter:review` approval marks the design phase `complete`.

### Gate checks

Every phase has gate checks defined in `workflow/gates/`. Three types:
- **Auto checks** — deterministic; the loop agent evaluates mechanically
- **AI checks** — judgment-based; the loop agent evaluates using reasoning
- **Human gate** — requires architect sign-off via `/jupiter:review`

Gap = count of required checks failing. Phase ready for human review when gap = 0 on auto and AI checks.

---

## Commands

All commands use the `/jupiter:` namespace.

| Command | Purpose |
|---------|---------|
| `/jupiter:start` | **Primary entry point** — first run bootstraps workspace + captures intent seed + runs first iteration; subsequent runs detect state and route to the right next action |
| `/jupiter:init` | Scaffold workspace only (programmatic use; start calls this on first run) |
| `/jupiter:iterate` | Run one loop iteration on the current phase |
| `/jupiter:status` | Show phase progress, gate status, and pending escalations |
| `/jupiter:review` | Record human gate decision (approve / reject / refine) |
| `/jupiter:review --panel` | Invoke all 5 reviewer agents, then record human gate decision |
| `/jupiter:review --spec` | Run spec boundary check, then record human gate decision |
| `/jupiter:spawn --type poc\|discovery\|spike` | Create a time-boxed child initiative |
| `/jupiter:gaps` | REQ key traceability check across requirements and design |
| `/jupiter:handoff` | Generate architecture handoff package |
| `/jupiter:assess --artifact <path>` | Evaluate an externally-produced artifact |

---

## Agents

| Agent | Role |
|-------|------|
| `agents/loop.md` | The core loop agent — runs gate checks, produces artifacts, emits events |
| `agents/reviewer-ea.md` | Enterprise Architect — strategic fit, enterprise standards, portfolio impact |
| `agents/reviewer-ba.md` | Business Architect — business capability coverage, stakeholder impact |
| `agents/reviewer-da.md` | Data Architect — data model, governance, integration integrity |
| `agents/reviewer-sa.md` | Solution Architect — technical soundness, design quality, NFR coverage |
| `agents/reviewer-eng.md` | Engineering Lead — feasibility, delivery risk, tech debt |

Reviewer agents are invoked by `/jupiter:review --panel`. They produce text reports — they do not emit events or make decisions.

---

## Workspace Layout

```
workspace/
  INTENT.md                        ← intent statement (starting point)
  log.jsonl                        ← append-only activity log (source of truth for state)
  context/
    project.yml                    ← project identity and constraints
    policy/                        ← regulatory and policy documents
    standards/                     ← architecture standards
    landscape/                     ← integration landscape constraints
    adrs/                          ← prior ADRs loaded as guardrails
    glossary/                      ← domain vocabulary
  initiatives/
    {id}.yml                       ← one file per initiative (machine-readable state)
  artifacts/
    requirements/
      {id}-requirements.md         ← requirements artifact
    design/
      {id}-SAD.md                  ← Solution Architecture Document
      adrs/
        ADR-{NNN}-{slug}.md        ← Architecture Decision Records
    gate-reports/
      {id}-{phase}-latest.json     ← latest gate report per initiative+phase (overwritten each iteration)
  assessment/
    inbox/                         ← drop externally-produced artifacts here
    {assessment-id}/
      findings.md                  ← assessment findings report
  handoff-{version}.yml            ← handoff manifest (produced by /jupiter:handoff)
```

---

## Configuration Layout

```
workflow/
  stages.yml                       ← phase topology and key format definitions
  gates/
    intent-requirements.yml        ← gate checks for Requirements phase
    requirements-design.yml        ← gate checks for Design phase
    assessment-architecture.yml    ← gate checks for Architecture/Design assessment
    assessment-process.yml         ← gate checks for Engineering Process assessment
    assessment-requirements.yml    ← gate checks for Requirements/Analysis assessment
  profiles/
    architecture.yml               ← standard governance profile (all 3 phases)
    assessment.yml                 ← evaluate-only profile
    discovery.yml                  ← exploration profile (time-boxed)
    spike.yml                      ← technical investigation profile (time-boxed)
```

---

## Activity Log

`workspace/log.jsonl` is the source of truth for initiative state. It is append-only — never modify existing lines.

Seven event types:

| Event | When emitted |
|-------|-------------|
| `project_initialized` | `/jupiter:init` completes |
| `iteration_completed` | Every `/jupiter:iterate` loop |
| `phase_complete` | Human gate approved, phase marked done |
| `phase_reviewed` | Human gate decision recorded (any decision) |
| `initiative_spawned` | `/jupiter:spawn` creates a child initiative |
| `gaps_checked` | `/jupiter:gaps` completes |
| `handoff_created` | `/jupiter:handoff` completes |

---

## REQ Key Format

`REQ-{TYPE}-{DOMAIN}-{SEQ}`

| TYPE | Meaning |
|------|---------|
| F | Functional — what the system must do for users or the business |
| NFR | Non-Functional — performance, availability, scalability, maintainability |
| BR | Business Rule — domain constraints, policies, business logic |
| C | Compliance — legal, regulatory, standards obligations |
| S | Security — authentication, authorisation, data protection |

DOMAIN: 2–5 uppercase letters (e.g. PROC, AUTH, RPT, NOTIF)
SEQ: 3-digit zero-padded (001, 002, ...)
Keys are immutable once assigned. Do not reuse or renumber.

---

## Component Key Format

`COMP-{NNN}` — 3-digit zero-padded (001, 002, ...)

---

## ADR Key Format

`ADR-{NNN}-{slug}.md` — 3-digit sequence + lowercase-hyphenated slug

ADR status values: `Proposed` → `Accepted` or `Superseded`. No ADR may be `Proposed` at handoff.

---

## Key Design Principles

**1. Requirements are tech-agnostic.** Requirements describe WHAT the system must do for users and the business — not HOW the architecture responds. A requirement expressed as an architecture decision is a requirements-phase defect.

**2. The component map precedes the SAD.** Before writing the SAD, the architect maps every REQ key to an architecture building block (COMP-NNN). The component map is §4 of the SAD and must be architect-approved before SAD writing begins.

**3. Human gate is non-negotiable.** The loop agent never auto-approves the human gate. The loop agent reports READY FOR REVIEW; the architect runs `/jupiter:review`.

**4. Log is append-only.** State is derived from `workspace/log.jsonl`. Never modify existing lines — only append.

**5. Commands are thin dispatchers.** Each command: validate → load config → invoke agent → write event → report. No business logic in commands.

**6. Reviewer agents are pure evaluation agents.** Reviewers produce a structured text report and stop. They do not emit events, maintain state, or make decisions.

---

## Working in This Directory

1. **Start with `/jupiter:start`.** On first run it bootstraps the workspace and captures the intent seed. On subsequent runs it detects state and routes — you don't need to remember which command comes next.
2. **Read `workspace/log.jsonl` to understand history.** The initiative file and status report are derived views — the log is authoritative.
3. **Iterate, then review.** Run `/jupiter:iterate` until gap = 0, then `/jupiter:review` for the human gate. `/jupiter:start` does this routing automatically.
4. **Use the correct key formats.** REQ-{TYPE}-{DOMAIN}-{SEQ}, COMP-{NNN}, ADR-{NNN}-{slug}.
5. **Append events, never modify.** The only authoritative write is an append to `workspace/log.jsonl`.
6. **Human gate is the architect's decision.** Never emit `phase_complete` without an explicit architect approval recorded via `/jupiter:review`.

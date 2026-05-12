# /jupiter:init — Scaffold a new Jupiter workspace

Initialise a new Jupiter workspace for an architecture initiative.

## Usage

```
/jupiter:init [--project <name>] [--profile <profile>]
```

**Arguments:**
- `--project <name>` — project name (prompted if omitted)
- `--profile <profile>` — workflow profile: `architecture` (default), `assessment`, `discovery`, `spike`

## What this command does

1. If no workspace exists, scaffold the workspace directory structure.
2. Run a guided 5-question setup to establish project identity.
3. Create `workspace/context/project.yml` from answers.
4. Seed `workspace/context/constraint-dimensions.yml` from the standard template.
5. Create `workspace/INTENT.md` as the starting point for the intent phase.
6. Create the first initiative file at `workspace/initiatives/{initiative-id}.yml`.
7. Emit a `project_initialized` event to `workspace/log.jsonl`.
8. Print a summary: project identity, profile, first command to run.

---

## Execution

### Step 1 — Check workspace state

Read `workspace/log.jsonl` if it exists. If a `project_initialized` event is present, the workspace is already initialised. Confirm with the architect before reinitialising.

If `workspace/` does not exist, create it with this structure:
```
workspace/
  context/
    glossary/
    landscape/
    policy/
    standards/
    adrs/
  initiatives/
  state/
    gate-reports/
  artifacts/
    requirements/
    design/
      adrs/
    spawn/
    assessment/
      inbox/
    handoff/
  INTENT.md
  log.jsonl
```

### Step 2 — Guided setup (5 questions)

Ask these questions one at a time. Accept answers before asking the next.

**Q1: What is this project called?**
(Short name, used as the project identifier. Example: "Invoice Processing Modernisation")

**Q2: Who is the business owner for this initiative?**
(Name and role. This person confirms requirements are correct.)

**Q3: Who is the lead architect?**
(Name. This person approves the SAD and ratifies ADRs.)

**Q4: Are there any compliance or regulatory obligations for this project?**
(Examples: GDPR, PCI-DSS, SOX, ISO 27001. If none, say "None".)

**Q5: Are there existing architectural constraints I should know about?**
(Examples: must run on Azure, must integrate with SAP, must use the corporate API gateway. If none, say "None".)

### Step 3 — Create project.yml

Write `workspace/context/project.yml`:

```yaml
project:
  id: "{slugified-project-name}"
  name: "{Q1 answer}"
  business_owner: "{Q2 answer}"
  lead_architect: "{Q3 answer}"
  profile: "{profile argument, default: architecture}"
  created: "{ISO-8601 date}"

scope:
  in_scope: []
  out_of_scope: []

constraints:
  compliance: {parse Q4 answer into a list, or []}
  existing: {parse Q5 answer into a list, or []}
```

### Step 3b — Seed constraint-dimensions.yml

Copy `workflow/templates/constraint-dimensions.yml` to `workspace/context/constraint-dimensions.yml`. This file declares the architecture constraint dimensions every design must explicitly resolve. Do not modify the template values — the architect populates `current_binding` and `resolved_by` per project later, before the first design iteration.

If the workspace already has `workspace/context/constraint-dimensions.yml` (re-init), do not overwrite it.

### Step 4 — Create INTENT.md

Write `workspace/INTENT.md` with this starter content:

```markdown
# Intent

*Describe the initiating problem, opportunity, or architectural need.
What is changing and why? What outcome does the business need?*

## Problem Statement

[Replace with a clear description of what is broken, missing, or needed.]

## Business Context

[Replace with the business situation that makes this initiative necessary.]

## Desired Outcomes

[Replace with the business outcomes this initiative should deliver.]

## Known Constraints

[Replace with any constraints already known at intent time, or "None identified yet."]
```

### Step 5 — Create first initiative

Generate an initiative ID: `{project-id}-001` (or increment if `workspace/initiatives/` already contains files).

Write `workspace/initiatives/{initiative-id}.yml`:

```yaml
initiative:
  id: "{initiative-id}"
  title: "{Q1 answer}"
  profile: "{profile}"
  status: not_started
  created: "{ISO-8601 date}"

phases:
  intent:
    status: not_started
    artifact: workspace/INTENT.md
    iteration_count: 0
    gate_result: null

  requirements:
    status: not_started
    artifact: "workspace/artifacts/requirements/{initiative-id}-requirements.md"
    iteration_count: 0
    gate_result: null

  design:
    status: not_started
    artifact: "workspace/artifacts/design/{initiative-id}-SAD.md"
    iteration_count: 0
    gate_result: null
    human_gate_status:           # tracks each design human gate independently
      HG-RD-002: pending         # SAD approved
      HG-RD-003: pending         # ADRs ratified
      HG-RD-004: pending         # stakeholder review complete

context_hash: null
```

(Omit the requirements and design phases if the profile is `assessment`, `discovery`, or `spike`.)

### Step 6 — Emit event

Append to `workspace/log.jsonl`:
```json
{"event": "project_initialized", "ts": "{ISO-8601}", "project": "{project-id}", "initiative": "{initiative-id}", "profile": "{profile}"}
```

### Step 7 — Print summary

```
Jupiter workspace initialised.

Project:    {project name}
Profile:    {profile}
Initiative: {initiative-id}

Context files to add (optional — place in workspace/context/ before iterating):
  workspace/context/policy/     ← regulatory documents, compliance mandates
  workspace/context/standards/  ← architecture standards
  workspace/context/landscape/  ← integration landscape constraints
  workspace/context/adrs/       ← prior ADRs as guardrails
  workspace/context/glossary/   ← domain vocabulary

Constraint-dimensions file (seeded — fill in before first design iteration):
  workspace/context/constraint-dimensions.yml
    Populate current_binding and resolved_by for each mandatory dimension
    (ecosystem, deployment, security, build_system) with the project's existing
    standards or prior ADR ids. The design loop reads this file every iteration.

Next step:
  1. Edit workspace/INTENT.md with the initiating problem statement.
  2. Run /jupiter:iterate to begin the requirements phase.
```

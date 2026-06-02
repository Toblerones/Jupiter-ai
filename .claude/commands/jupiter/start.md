# /jupiter:start — Primary entry point: bootstrap or continue an initiative

State-detecting entry point for Jupiter. Run this instead of remembering which command comes next.

On first run it bootstraps the workspace, captures a brief intent seed, scans for existing context, and runs the first intent iteration. On subsequent runs it detects the current state and routes to the right next action.

## Usage

```
/jupiter:start [--initiative <id>]
```

**Arguments:**
- `--initiative <id>` — initiative ID (auto-detected if only one active exists)

---

## Execution

### Step 1 — Detect workspace state

Check whether `workspace/log.jsonl` exists and contains a `project_initialized` event.

- If **no workspace or no `project_initialized` event** → first-run menu (Step 2)
- If **workspace exists and initialised** → state detection (Step 8)

---

## FIRST-RUN FLOW

### Step 2 — First-run menu

Present five options. Do not show all command details — keep it minimal:

```
Welcome to Jupiter. What would you like to do?

  1. Start a new architecture initiative
     — set up workspace, capture intent, begin requirements

  2. Continue existing work
     — resume from a workspace in another directory

  3. Quick spike or discovery
     — explore a question or unknown without committing to a full initiative

  4. Assess an existing artifact
     — evaluate a SOAP, requirements doc, or ADR against project constraints

  5. Import existing requirements
     — normalise a business requirements document; intent derived automatically

  6. Start an architecture-led transformation
     — pain + target conceptual architecture as input; multi-stream inquiry via
       Problem Spaces and Data Product Definitions; collaborative discovery with
       upstream producers

Enter 1, 2, 3, 4, 5, or 6 (or press Enter for 1):
```

**Option 1 — New initiative**: Proceed to Step 3 (project identity questions). This is the default.

**Option 2 — Continue existing work**: Ask:
> "Where is the existing workspace? (Enter the path to the directory containing `workspace/log.jsonl`)"

Validate the path exists and contains a `workspace/log.jsonl` with a `project_initialized` event. If valid, load the initiative from that location and proceed to state detection (Step 7) as if the workspace were local. If the path is invalid, error and let the architect try again.

**Option 3 — Quick spike or discovery**: Ask:
> "Spike or discovery? (spike = answer a specific technical question; discovery = explore an ill-defined problem space)"

Then ask:
> "In one sentence — what are you investigating?"

Write the answer to `workspace/INTENT.md` Problem Statement. Create a child initiative with the chosen profile (`spike` or `discovery`) using `/jupiter:spawn --type {type}`. Then run `/jupiter:iterate` immediately to begin the first iteration under the time-boxed profile. Do NOT run the full Q1–Q6 identity flow — spike and discovery are lightweight by design. Ask only:
> "Project name (or press Enter to use the directory name):"

**Option 4 — Assess existing artifact**: Ask:
```
How would you like to provide the artifact?

  A. File path  — local file (SOAP, requirements doc, ADR, or equivalent)
  B. Confluence — paste a Confluence page URL and Jupiter will fetch it

Enter A or B (or press Enter for A):
```

**Option 4A — File path:** Ask:
> "Path to the artifact to assess: (absolute or relative path)"

Validate the path. If the file does not exist or cannot be read, error and let the architect try again. Set `artifact_path` to the absolute path.

**Option 4B — Confluence URL:** Ask:
> "Confluence page URL: (paste the full URL, e.g. https://your-org.atlassian.net/wiki/spaces/PROJ/pages/123456)"

Use the Atlassian MCP to fetch the page content from the URL provided. If the MCP call fails (page not found, permission denied, unreachable), show the error and let the architect try again — do not proceed with empty content.

Once content is fetched:
- Create directory `workspace/artifacts/assessment/inbox/` if it does not exist.
- Derive a safe filename from the Confluence page title (lowercase, spaces → hyphens, strip special characters). Example: `solution-architecture-document.md`.
- Write the fetched page content to `workspace/artifacts/assessment/inbox/{filename}`.
- Set `artifact_path` to the absolute path of the written file.

Print:
```
Fetched from Confluence: {page title}
Saved to:               workspace/artifacts/assessment/inbox/{filename}
```

**Continuing (both options):**

If no workspace exists yet, ask Q1 (project name) only to initialise the workspace first. Do not run the full identity flow — assessment is a focused engagement.

Then run `/jupiter:assess --artifact {artifact_path}`.

**Option 5 — Import existing requirements**: Proceed to Step 2b (requirements-first flow).

**Option 6 — Architecture-led transformation**: Sets profile = `transformation`. Proceed to Step 3 (project identity questions) — the same Q1–Q6 flow applies, but Q6 captures pain PLUS the target conceptual architecture (the architect's understanding of where we want to go, not just what we have today). In Step 5, run `/jupiter:init --profile transformation`. After init, Step 6 runs the first vision iteration: the loop agent helps draft the capability map (mandatory) and optional HL conceptual sketch from the seed + loaded context. After Vision is approved, the next iterate proposes candidate Problem Spaces from capabilities flagged unclear or unknown in the capability map.

---

### Step 2b — Requirements-first flow (Option 5)

Ask:
```
How would you like to provide the requirements document?

  A. File path  — local file (BRD, user story set, or equivalent)
  B. Confluence — paste a Confluence page URL and Jupiter will fetch it

Enter A or B (or press Enter for A):
```

**Option A — File path:**

Ask:
> "Path to the business requirements document: (absolute or relative path)"

Validate the path. If the file does not exist or cannot be read, error and let the architect try again.

Set `source_document` to the absolute path of that file. Leave `source_url` unset.

**Option B — Confluence URL:**

Ask:
> "Confluence page URL: (paste the full URL, e.g. https://your-org.atlassian.net/wiki/spaces/PROJ/pages/123456)"

Use the Atlassian MCP to fetch the page content from the URL provided. If the MCP call fails (page not found, permission denied, unreachable), show the error and let the architect try again — do not proceed with empty content.

Once content is fetched:
- Create directory `workspace/context/source/` if it does not exist.
- Derive a safe filename from the Confluence page title (lowercase, spaces → hyphens, strip special characters). Example: `invoice-processing-requirements.md`.
- Write the fetched page content to `workspace/context/source/{filename}`.
- Set `source_document` to the absolute path of the written file.
- Set `source_url` to the original Confluence URL (for traceability).

Print:
```
Fetched from Confluence: {page title}
Saved to:               workspace/context/source/{filename}
```

---

**Continuing (both options):**

Then ask Q1–Q5 from Step 3 (project identity questions). Skip Q6 — the source document replaces it. After Q5, print:
```
Problem statement will be derived from: {filename}
The loop agent will extract intent and normalise requirements in the first iteration.
```

Run the context scan (Step 4) as normal.

Then scaffold the workspace with the `requirements-first` profile:
- Run `/jupiter:init --profile requirements-first` passing Q1–Q5 answers
- After init completes, write `source_document: {absolute path}` to the initiative YAML under `initiative:`
- If the source came from Confluence, also write `source_url: {confluence url}` to the initiative YAML under `initiative:`
- Do NOT write a Q6 seed to INTENT.md — the loop agent will produce INTENT.md from the source document during iteration. Leave the placeholder content that init wrote as-is.

Print:
```
Workspace initialised.
Project:    {project name}
Profile:    requirements-first
Initiative: {initiative-id}
Source doc: {path}
{Source URL: {url}   ← only shown if sourced from Confluence}

Running first requirements iteration...
```

Run `/jupiter:iterate --phase requirements`.

After the gate report prints, show:
```
Next: Run /jupiter:review to approve the requirements and derived intent, or
      /jupiter:iterate to address gaps found in the gate report.
```

If the gate report shows `intent_derivation: inferred`, also show:
```
! Intent was inferred from the source document, not directly derived.
  Review the confidence note in workspace/initiatives/{id}.yml and confirm
  the inferred intent with the business owner before approving.
  HG-IG-001 will block the human gate until this is recorded.
```

Then stop.

---

### Step 3 — Project identity questions

Ask these questions **one at a time**. Accept each answer before asking the next.

**Q1: What is this project called?**
(Short name used as the project identifier. Example: "Invoice Processing Modernisation")

**Q2: Who is the business owner for this initiative?**
(Name and role. This person confirms requirements are correct.)

**Q3: Who is the lead architect?**
(Name. This person approves the SOAP and ratifies ADRs.)

**Q4: Are there any compliance or regulatory obligations for this project?**
(Examples: GDPR, PCI-DSS, SOX, ISO 27001. If none, say "None".)

**Q5: Are there existing architectural constraints I should know about?**
(Examples: must run on Azure, must integrate with SAP, must use the corporate API gateway. If none, say "None".)

**Q6: In one or two sentences — what is the architecture problem or need this initiative addresses?**
(This seeds the intent. Don't worry about precision — the loop will elaborate it from your context.
Example: "Invoice processing is done in spreadsheets — slow, error-prone, and unauditable. We need a digital system.")

### Step 4 — Context scan

After Q6, scan the current directory and common nearby paths for architecture documents the architect might want to load as guardrails.

Scan for files matching these patterns (non-recursive, one level deep):
- `*.md` files that appear to be architecture standards, landscape maps, or policy documents (look at filenames: `standards*`, `landscape*`, `policy*`, `compliance*`, `adr*`, `architecture*`)
- Any `adrs/` or `standards/` or `policy/` subdirectories

If candidate files or directories are found, list them and ask:
```
Found possible context files:
  - ./standards/architecture-standards.md
  - ./adrs/ (3 files)
  - ./compliance/gdpr-policy.md

Load any of these as guardrails? (Enter numbers separated by commas, or press Enter to skip)
```

For each selected item:
- Classify by content/name: `policy/`, `standards/`, `landscape/`, `adrs/`, or `glossary/`
- Copy to the appropriate `workspace/context/{category}/` directory

If no candidates are found, ask:
```
Do you have existing architecture standards, landscape documents, prior ADRs,
or policy documents to load as guardrails?
(Enter file paths, or press Enter to skip and add them later to workspace/context/)
```

Accept paths, classify, and copy. If skipped, continue.

### Step 5 — Scaffold workspace

Run `/jupiter:init` passing the answers from Q1–Q5 as arguments. Init owns all workspace creation logic — do not duplicate it here.

After init completes, validate:
- `workspace/log.jsonl` exists and contains a `project_initialized` event
- `workspace/initiatives/` contains exactly one `.yml` file
- That file has a nested `initiative:` object with an `id` field (not a flat structure)

If validation fails, surface the specific problem and stop — do not proceed to Step 6.

Then write `workspace/INTENT.md`: place the Q6 answer in the Problem Statement section, synthesise Q4/Q5 into the Known Constraints section, and leave Business Context and Desired Outcomes as `[To be elaborated by the loop agent from project context.]`

The INTENT.md at this point will have:
- Problem Statement: Q6 answer (architect's seed)
- Business Context: `[To be elaborated by the loop agent from project context.]`
- Desired Outcomes: `[To be elaborated by the loop agent from project context.]`
- Known Constraints: synthesised from Q4 (compliance) and Q5 (constraints), or `[None identified at intent time.]`

Print:
```
Workspace initialised.
Project:    {project name}
Initiative: {initiative-id}

Context loaded:
  {list of files copied, or "No context files loaded — add them to workspace/context/ before iterating"}

Running first intent iteration...
```

### Step 6 — Run first phase iteration

For profile `architecture`, `discovery`, `spike`, or `assessment`: invoke `/jupiter:iterate --phase intent`. The loop agent loads the seed and context and produces the full INTENT.md. When gap = 0, status is READY FOR REVIEW.

For profile `transformation`: invoke `/jupiter:iterate --phase vision`. The loop agent loads the seed (pain + target conceptual architecture) and context, then helps draft the capability map (mandatory) and optional HL conceptual sketch. When gap = 0, status is READY FOR REVIEW. After Vision is approved, the next iterate proposes candidate Problem Spaces from unclear / unknown capabilities.

The gate report shows which checks pass. The architect runs `/jupiter:review` to approve before the next phase begins.

After the gate report prints, show:
```
Next: Run /jupiter:review to confirm the {phase} statement, or
      /jupiter:iterate to refine it further.
```

Then stop. The architect reads the produced artifacts, refines if needed (by running iterate again), and approves via review.

---

## SUBSEQUENT-RUN FLOW

### Step 7 — Load initiative state

Read `workspace/initiatives/{id}.yml` (auto-detect if one initiative exists; use `--initiative` if multiple).

Read the last few events from `workspace/log.jsonl` to understand recent activity.

### Step 8 — Detect state and route

Walk phase states in order. The first matching condition determines the action.

| State | Detection | Action |
|-------|-----------|--------|
| `INTENT_LOOPING` | `phases.intent.status == in_progress` | Run `/jupiter:iterate --phase intent` |
| `INTENT_READY` | `phases.intent.status == ready_for_review` | Prompt: "Intent is ready for review." → Run `/jupiter:review` |
| `REQUIREMENTS_NOT_STARTED` | (`phases.intent.status == complete` AND `phases.requirements.status == not_started`) OR (`profile == requirements-first` AND `phases.requirements.status == not_started`) | Run `/jupiter:iterate --phase requirements` |
| `REQUIREMENTS_LOOPING` | `phases.requirements.status == in_progress` | Run `/jupiter:iterate --phase requirements` |
| `REQUIREMENTS_READY` | `phases.requirements.status == ready_for_review` | Prompt: "Requirements are ready for review." → Run `/jupiter:review` |
| `DESIGN_IN_PROGRESS` | `phases.requirements.status == complete` AND `phases.design.status == in_progress` OR `phases.design.status == not_started` | Run `/jupiter:iterate --phase design` |
| `DESIGN_READY` | `phases.design.status == ready_for_review` | Prompt: "SOAP is ready for panel review." → Run `/jupiter:review --panel` |
| `DESIGN_COMPLETE` | `phases.design.status == complete` | Show completion → suggest `/jupiter:gaps` then `/jupiter:handoff` |
| `BLOCKED` | Any phase `status == blocked` | Surface the blocker from the last gate report. Do not auto-iterate. |
| `BUDGET_EXPIRED` | Any phase `status == budget_expired` | Prompt: "Time-box reached." → Run `/jupiter:review` to record findings |

**Transformation profile** — additional states (evaluated when `profile == transformation`; the standard states above use different phase names and are not applicable for transformation initiatives):

| State | Detection | Action |
|-------|-----------|--------|
| `VISION_LOOPING` | `phases.vision.status == in_progress` | Run `/jupiter:iterate --phase vision` |
| `VISION_READY` | `phases.vision.status == ready_for_review` | Prompt: "Vision is ready for review." → Run `/jupiter:review` |
| `PROBE_NOT_STARTED` | `phases.vision.status == complete` AND `phases.probe.status == not_started` | Run `/jupiter:iterate --phase probe` (triggers initial PS proposal pass) |
| `PROBE_LOOPING` | `phases.probe.status == in_progress` | Run `/jupiter:iterate --phase probe` |
| `PROBE_READY` | `phases.probe.status == ready_for_review` | Prompt: "Probe is ready for review." → Run `/jupiter:review` |
| `CONVERGE_NOT_STARTED` | `phases.probe.status == complete` AND `phases.converge.status == not_started` | Run `/jupiter:iterate --phase converge` |
| `CONVERGE_LOOPING` | `phases.converge.status == in_progress` | Run `/jupiter:iterate --phase converge` |
| `CONVERGE_READY` | `phases.converge.status == ready_for_review` | Prompt: "Converge is ready for review." → Run `/jupiter:review` |
| `DESIGN_T_NOT_STARTED` | `phases.converge.status == complete` AND `phases.design_transformation.status == not_started` | Run `/jupiter:iterate --phase design_transformation` |
| `DESIGN_T_LOOPING` | `phases.design_transformation.status == in_progress` | Run `/jupiter:iterate --phase design_transformation` |
| `DESIGN_T_READY` | `phases.design_transformation.status == ready_for_review` | Prompt: "SOAP is ready for panel review." → Run `/jupiter:review --panel` |
| `DESIGN_T_COMPLETE` | `phases.design_transformation.status == complete` | Show completion → suggest `/jupiter:gaps` then `/jupiter:handoff` |

For all looping states, print the state before running:
```
JUPITER STATUS
==================================
Initiative: {id}
State:      {state label}
Phase:      {current phase} | Iteration {n}

Running /jupiter:iterate...
```

For all review states, print the state and ask:
```
JUPITER STATUS
==================================
Initiative: {id}
State:      {state label}
Phase:      {current phase} ready for review

Run /jupiter:review? (yes / no)
```
If yes, run the review command. If no, stop and let the architect proceed manually.

For `DESIGN_COMPLETE`, print:
```
JUPITER STATUS
==================================
Initiative: {id}
State:      COMPLETE

All three phases are done.

Suggested next steps:
  /jupiter:gaps      — verify REQ key coverage before handoff
  /jupiter:handoff   — generate the architecture handoff package
```

For `BLOCKED`, print:
```
JUPITER STATUS
==================================
Initiative: {id}
State:      BLOCKED
Phase:      {current phase}

Blocker: {blocker description from last gate report}

Options:
  (a) Edit the upstream artifact and run /jupiter:iterate --phase {upstream phase}
  (b) /jupiter:spawn --type discovery — investigate the gap
  (c) /jupiter:iterate — override and continue with a documented assumption

Run /jupiter:status for full escalation detail.
```

### Step 9 — Stuck detection

Before routing (Step 8), check the last 3 `iteration_completed` events for the current phase. If the same check IDs appear in `failing_checks` across all 3, this is a stuck loop.

Surface before routing:
```
! Stuck: {check-id} has failed {n} consecutive iterations.
  This may need architect input before the next iterate will converge.
  Run /jupiter:status for details, or continue.
```

Then proceed with the normal routing from Step 8.

---

## Notes

`/jupiter:start` is the recommended entry point for interactive use. It replaces the need to remember command sequences.

`/jupiter:init` remains available for programmatic or non-interactive use — it accepts arguments directly and skips the guided questions. `/jupiter:start` calls the same init logic on first run.

Human gates always require explicit architect action — `/jupiter:start` will prompt but never auto-approve a review.

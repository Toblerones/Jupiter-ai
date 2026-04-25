# /jupiter:iterate

Run one loop iteration on the current phase of an initiative.

## Usage

```
/jupiter:iterate [--initiative <id>] [--phase <phase>]
```

**Arguments:**
- `--initiative <id>` — initiative ID (auto-detected if only one active initiative exists)
- `--phase <phase>` — override the auto-detected phase (intent | requirements | design | assessment)

## What this command does

1. Detect the active initiative and current phase.
2. Load the gate config for the current phase transition.
3. Load project context per the active profile.
4. Invoke the loop agent (`agents/loop.md`) to produce or refine the phase artifact.
5. The loop agent runs all gate checks and produces a gate report.
6. The loop agent updates the initiative file and appends an event to the log.
7. Print the gate report.

Gate runs inside iterate. There is no separate gate command.

---

## Execution

### Step 1 — Detect initiative and phase

Read `workspace/log.jsonl`. Find the most recent `project_initialized` event to identify the active project. Find all active initiative files in `workspace/initiatives/`.

If `--initiative` is provided, use that initiative. If only one initiative exists, use it. If multiple initiatives exist and none is specified, list them and ask the architect to specify.

Determine the current phase:
1. Load `workspace/initiatives/{id}.yml`
2. Walk phases in order (per the profile's `phases.include` list from `workflow/stages.yml`)
3. The current phase is the first phase that is not `complete`
4. If `--phase` is provided, use that phase instead

### Step 1a — Intent phase auto-completion

If the current phase is `intent` and the active profile is `architecture` (or any profile where intent is just a manually-edited `INTENT.md` rather than a loop-produced artifact):

1. Read `workspace/INTENT.md`.
2. Check that all four placeholder markers have been replaced:
   - `[Replace with a clear description of what is broken, missing, or needed.]`
   - `[Replace with the business situation that makes this initiative necessary.]`
   - `[Replace with the business outcomes this initiative should deliver.]`
   - `[Replace with any constraints already known at intent time, or "None identified yet."]`
3. If any placeholder remains, halt with:
   > "INTENT.md still contains placeholder text. Edit workspace/INTENT.md before iterating. Run /jupiter:iterate again when done."
4. If all placeholders are replaced, mark the intent phase complete:
   - Update initiative file: `phases.intent.status = complete`
   - Append `phase_complete` event:
     ```json
     {"event": "phase_complete", "ts": "{ISO-8601}", "initiative": "{id}", "phase": "intent"}
     ```
5. Re-run the phase detection (Step 1, points 2–3) and continue with the next phase (typically `requirements`).

For `discovery` and `spike` profiles, the intent phase is a loop-produced artifact (exploration report or spike report) — skip this auto-completion logic and let the loop agent handle the phase normally.

### Step 2 — Load gate config

Map the current phase (and active profile) to its gate config file:
- If current phase is `requirements` → `workflow/gates/intent-requirements.yml`
- If current phase is `design` → `workflow/gates/requirements-design.yml`
- If current phase is `assessment` → `workflow/gates/requirements-assessment.yml`
- If current phase is `intent`:
  - If active profile is `discovery` → `workflow/gates/discovery-intent.yml` (intent variant produces a discovery report)
  - If active profile is `spike` → `workflow/gates/spike-intent.yml` (intent variant produces a spike report)
  - Otherwise (architecture profile) → no gate config; intent is a manually-edited INTENT.md handled by Step 1a

### Step 3 — Load profile

Load the active profile from `workflow/profiles/{profile}.yml` (profile from `workspace/initiatives/{id}.yml`).

Determine context density from the profile. Load context files:
- Required: `workspace/context/project.yml`
- Per density setting: load optional context directories if present

### Step 4 — Check budget and stuck threshold

Load the iteration count for the current phase from the initiative file.

**Budget check** — if the profile defines `iteration.budget` as a finite integer (e.g. discovery `budget: 3`, spike `budget: 2`) and the iteration count is `>= budget`, halt the loop:
- Set `phases.{phase}.status = budget_expired` in the initiative file. The artifact produced on the last iteration stands as the best-available output, even if gap > 0 — this is the time-box contract for discovery/spike.
- Do **not** auto-emit `phase_complete`. Completion still requires architect review (the discovery/spike profiles have `human_recommended: true`).
- Append an `iteration_completed` event with `status: budget_expired` and the current `failing_checks` array, so `/jupiter:status` and the activity log show the time-box reason for halting.
- Print the most recent gate report and: "Iteration budget reached ({budget}). The artifact stands as the time-box output. Run /jupiter:review to record acceptance, or /jupiter:spawn to extend investigation under a new initiative."
- Do not invoke the loop agent.

If `iteration.budget` is `unlimited` (architecture profile), skip the budget check.

**Stuck threshold check** — if the iteration count is `>= stuck_threshold`, follow the `stuck_action`:
- Surface a status report identifying which checks are not passing
- Request architect guidance before continuing
- Do not invoke the loop agent

### Step 5 — Invoke loop agent

Invoke `agents/loop.md` with:
- Initiative file path
- Current phase
- Gate config (loaded in Step 2)
- Current artifact path (from initiative file, may not exist yet on iteration 1)
- Loaded context

The loop agent runs Steps 1–7 as defined in `agents/loop.md` and produces the gate report.

### Step 6 — Print output

Print the gate report from the loop agent exactly as produced. Do not summarise or reformat.

After the gate report, print the next action clearly:
- If status is LOOPING: "Run /jupiter:iterate to continue."
- If status is READY FOR REVIEW: "Run /jupiter:review to record human gate decision."
- If status is BLOCKED: "Resolve the blocker listed above before continuing."

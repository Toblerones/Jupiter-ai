# /jupiter:status — Show phase progress, gate status, and next action

Show the current state of an initiative: phase progress, gate check status, pending escalations, and next action.

## Usage

```
/jupiter:status [--initiative <id>]
```

**Arguments:**
- `--initiative <id>` — initiative ID (auto-detected if only one active initiative exists)

---

## Execution

### Step 1 — Load initiative state

Read `workspace/initiatives/{id}.yml` for phase statuses, iteration counts, and gate results.

Read `workspace/log.jsonl` and extract:
- All `iteration_completed` events for this initiative
- All `phase_complete` events for this initiative
- All `phase_reviewed` events for this initiative

### Step 2 — Detect pending escalations

Scan the recent `iteration_completed` events for the active initiative and identify:

1. **Persistently failing checks**: collect the `failing_checks` arrays from the last 3 consecutive iteration events for the current phase. Any check ID that appears in 2+ consecutive iterations is a persistent failure — surface it with the consecutive-failure count.

2. **Blocked iterations**: any iteration event with `status: "blocked"` in the most recent event for the current phase. Surface the blocker text from the loop agent's report.

3. **Stuck threshold breach**: if the iteration count for the current phase has reached the active profile's `stuck_threshold`, this is a stuck-loop escalation regardless of which checks are failing.

These are the pending escalations — items requiring architect action before the loop can progress.

### Step 3 — Print status report

```
JUPITER STATUS
==================================
Project:    {project name}
Initiative: {initiative-id}
Profile:    {profile}

Phase Progress:
  [✓] Intent         complete  (approved {date})
  [→] Requirements   in progress  (iteration {n})
  [ ] Design         not started

Current Phase: Requirements | Iteration {n}

Gate Check Status (last iteration):
  Auto Checks:   {pass}/{total} — {list of FAIL checks if any}
  AI Checks:     {pass}/{total} — {list of FAIL checks if any}
  Human Gate:    {PENDING | APPROVED on {date}}

  Gap: {n} required checks failing

{if escalations exist:}
Pending Escalations:
  ! {check-id} {check name} — failing for {n} consecutive iterations
    Suggested action: re-read the failure_message in workflow/gates/{phase}.yml
    and address the gap directly. If the check is unreachable, raise an exception.

  ! BLOCKED: {blocker description}
    Action required: {specific action before the loop can continue}

  ! STUCK: phase has reached stuck_threshold ({n} iterations)
    Suggested action: surface the gate report to the architect for guidance,
    or run /jupiter:spawn --type discovery to investigate the underlying issue.

Next Action:
  {one specific instruction — iterate | review | resolve escalation | address blocker}

Log: {total events} events in workspace/log.jsonl
     Last event: {event type} at {timestamp}
```

Use `[✓]` for complete phases, `[→]` for in-progress, `[ ]` for not started.

If no iterations have run yet, show a simplified view:
```
JUPITER STATUS
==================================
Project:    {project name}
Initiative: {initiative-id}
Profile:    {profile}

No iterations run yet.

Next Action: Edit workspace/INTENT.md, then run /jupiter:iterate.
```

---

## Transformation profile — output variations

When `profile == transformation`, adjust the standard status output as follows. All other profiles are unaffected.

**Phase Progress** uses the transformation phase set:
```
Phase Progress:
  [✓] Vision                   complete  (approved {date})
  [→] Probe                    in progress  (iteration {n})
  [ ] Converge                 not started
  [ ] Design (Transformation)  not started
```

**Cross-PS / DPD dashboard** — when the current phase is `probe` or `converge` (the phases with `work_units`), include this block after the standard Gate Check Status section. Source: `phases.{phase}.work_units` in the initiative file (cached from PS / DPD file scans by the loop agent's Step 7b). The `soap` sub-key (`work_units.soap`) is written by the loop agent's Step 7b from the gate report JSON `soap` block — use it to render the Living SOAP line.

```
Problem Spaces ({n_total}; {n_converging} converging, {n_closed} closed):
  PS-DIRECT-TAX        converging   2 open OQs    last activity 2026-05-28
  PS-INDIRECT-TAX      in-progress  6 open OQs    last activity 2026-05-25
  PS-DEFERRED-TAX      converging   1 open OQ     last activity 2026-05-30
  PS-GL-LEDGER-FLOW    in-progress  8 open OQs    last activity 2026-05-22 (stale)
  PS-SUBLEDGER-FLOW    open         15 open OQs   last activity 2026-05-20

Data Product Definitions ({n_total}; {n_aligned} aligned):
  DPD-001  Trade Capture Data Product            drafting       last activity 2026-05-30
  DPD-002  Tax Classification Data Product       discovering    last activity 2026-05-25

Living SOAP:  3 confirmed · 4 open  (workspace/artifacts/transformation/design/{id}-SOAP.md)

Phase Gap: sum of open + in-discussion OQs across all PS = {n}
Cross-PS flags (from last gate report):
  ! PS-GL-LEDGER-FLOW: 9 days stale, no activity_log update
  ! OQ-DIRECT-TAX-007 references PS-SUBLEDGER-FLOW (one-sided)
```

Source the Living SOAP line from `work_units.soap`: `confirmed` and `open` counts from the gate report JSON `soap` block; path from `work_units.soap.path`. If `work_units.soap` is absent (first iteration before SOAP skeleton exists), omit the line. If `open` > 0 and the phase is `converge`, append ` ← open elements block Converge close` as a warning flag.

For other transformation phases (vision, design_transformation), use the standard status format with the transformation phase set — no per-instance dashboard is rendered (those phases produce a single artifact set, not work_units).

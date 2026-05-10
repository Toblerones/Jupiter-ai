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

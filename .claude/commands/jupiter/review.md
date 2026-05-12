# /jupiter:review — Record a human gate decision (approve / reject / refine)

Human gate decision point. Records the architect's approval, rejection, or refinement request for the current phase. Optionally invokes the reviewer panel and/or runs a spec boundary check before the decision.

## Usage

```
/jupiter:review [--initiative <id>] [--panel] [--spec] [--decision <approve|reject|refine>] [--feedback "<text>"]
```

**Arguments:**
- `--initiative <id>` — initiative ID (auto-detected if only one active)
- `--panel` — invoke all 5 reviewer agents before presenting for architect decision
- `--spec` — run a spec boundary check (verifies requirements are tech-agnostic and complete) before the decision
- `--decision <approve|reject|refine>` — record the architect's decision directly (skip interactive prompt)
- `--feedback "<text>"` — attach feedback to a reject or refine decision

---

## Execution

### Step 1 — Load initiative and current phase

Load `workspace/initiatives/{id}.yml`. Determine the current phase and its artifact path.

Verify that the current phase status is `ready_for_review` (auto checks and AI checks passing). If status is `in_progress` or the last gate report shows a gap > 0 in required auto or AI checks, warn the architect:
> "Auto checks or AI checks are still failing. Running /jupiter:review before these pass means the human gate decision will be recorded before the artifact is fully ready. Proceed? (yes/no)"

### Step 2 — Spec boundary check (if --spec)

Only applies to the `requirements` phase. If `--spec` is not provided, skip this step.

Evaluate the requirements artifact against these spec boundary criteria:
1. No F-type requirement is expressed in architecture or implementation terms
2. No NFR target pre-empts a technology choice (e.g. "must use PostgreSQL")
3. No BR describes an implementation pattern rather than a domain rule
4. The requirements set is complete enough to constrain a design — key domains have requirements
5. No requirement is ambiguous enough to be interpreted in mutually exclusive ways

For each criterion: PASS or FAIL with a specific description.

Print the spec check report:
```
SPEC BOUNDARY CHECK
Initiative: {id}
Phase:      Requirements

  [PASS] No architecture-framed requirements
  [FAIL] REQ-F-PROC-003 specifies "must use REST API" — implementation choice, not business need
  [PASS] Requirements sufficient to constrain design
  [PASS] No ambiguous requirements
  ...

Spec Check: {n} issues found
```

If spec check fails, ask the architect whether to continue to the decision or return to `/jupiter:iterate` to address the issues first.

### Step 3 — Reviewer panel (if --panel)

Invoke each reviewer agent sequentially. Pass each reviewer:
- The current artifact path
- The artifact type (requirements | design)
- The initiative context path

Print each reviewer's report as it completes. Use clear headers:
```
══ Enterprise Architect ════════════════════════════════════════════════════
{EA reviewer report}

══ Business Architect ══════════════════════════════════════════════════════
{BA reviewer report}

══ Data Architect ══════════════════════════════════════════════════════════
{DA reviewer report}

══ Solution Architect ══════════════════════════════════════════════════════
{SA reviewer report}

══ Engineering Lead ════════════════════════════════════════════════════════
{ENG reviewer report}

Panel Summary:
  approve:   {count} reviewers
  concerns:  {count} reviewers
  block:     {count} reviewers
```

After printing all five reports and the summary, present to the architect:
> "Panel review complete. What is your decision? (approve / reject / refine)"

### Step 4 — Architect decision

If `--decision` was provided as an argument, use that value.
Otherwise, prompt:
> "Your decision for the {phase} phase: approve / reject / refine"
> (approve = advance; reject = return to iterate with required changes; refine = return to iterate with optional improvements)

If decision is `reject` or `refine` and no `--feedback` was provided, prompt:
> "Feedback for the next iteration:"

### Step 6 — Emit event and update initiative

Append to `workspace/log.jsonl`:
```json
{"event": "phase_reviewed", "ts": "{ISO-8601}", "initiative": "{id}", "phase": "{phase}", "decision": "{decision}", "feedback": "{feedback or null}", "panel_used": true|false, "spec_check_used": true|false}
```

**On `approve`** — apply phase-specific logic:

For `intent`, `requirements`, or `assessment` phases:
- Update initiative file: `phases.{phase}.status = complete`
- Append `phase_complete` event:
```json
{"event": "phase_complete", "ts": "{ISO-8601}", "initiative": "{id}", "phase": "{phase}"}
```

For the `design` phase:
- Update initiative file: `phases.design.human_gate_status.HG-RD-002 = approved`, `HG-RD-003 = approved`, `HG-RD-004 = approved`.
- Update initiative file: `phases.design.status = complete`
- Append `phase_complete` event for the design phase.

**On `reject` or `refine`**:
- Update initiative file: `phases.{phase}.status = in_progress`
- Record feedback: `phases.{phase}.last_feedback = "{feedback}"`
- No `phase_complete` event is emitted.

### Step 5 — Print result

For `approve`:
```
Phase approved: {phase}
Initiative: {id}

{phase} is complete.

Next: Run /jupiter:iterate to begin the {next-phase} phase.
```

For `reject`:
```
Phase rejected: {phase}{ — sub-phase if design}
Initiative: {id}

Feedback recorded: "{feedback}"

Next: Run /jupiter:iterate to address the feedback and produce a new draft.
```

For `refine`:
```
Refinement requested: {phase}{ — sub-phase if design}
Initiative: {id}

Feedback recorded: "{feedback}"

Next: Run /jupiter:iterate to incorporate the feedback.
```

---

## Notes on the human gate

The human gate is the architect's decision. This command records it — it does not make it. The loop agent never calls this command on its own behalf. When the loop agent reports status READY FOR REVIEW, that is its signal to the architect to run `/jupiter:review`.

The `--panel` flag replaces the v2 consensus-open + consensus-run flow. All five reviewers run sequentially in one command. The architect sees all five reports, then makes the decision. There is no voting threshold — the architect is the decision-maker.

The `--spec` flag replaces the v2 jup-spec-review command. It runs as a pre-check inside this command rather than as a separate flow.

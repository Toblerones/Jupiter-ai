# /jupiter:handoff — Generate the architecture handoff package

Generate an architecture handoff package. Runs readiness checks, produces a coverage report, and emits a handoff manifest.

## Usage

```
/jupiter:handoff [--initiative <id>] [--version <version>]
```

**Arguments:**
- `--initiative <id>` — initiative ID (auto-detected if only one active initiative exists)
- `--version <version>` — handoff version label (default: `1.0.0`)

---

## Execution

### Step 1 — Readiness check

Run four readiness checks before producing the handoff package. A FAIL on any check blocks the handoff.

**Check 1: All phases complete**
Load `workspace/initiatives/{id}.yml`. All phases in the active profile's `phases.include` list must have `status: complete`. A phase with `status: in_progress` or `not_started` means the initiative is not done.

**Check 2: Full requirements coverage**
Run the same coverage check as `/jupiter:gaps`:
- Every REQ-* key must appear in the SOAP Requirements Traceability table (§5).
- Coverage must be 100%. Any uncovered requirement blocks the handoff.

**Check 3: All ADRs ratified**
Every ADR in `workspace/artifacts/design/adrs/` must have `Status: Accepted` or `Status: Superseded`. No ADR may have `Status: Proposed` at handoff time.

**Check 4: Stakeholder Approval Record populated**
The SOAP §12 (Stakeholder Approval Record) must have at least one row with a decision of "Approved". An empty or unsigned approval record blocks the handoff.

### Step 2 — Print readiness check results

```
HANDOFF READINESS CHECK
Initiative: {id}
Version:    {version}

  [PASS] All phases complete
  [PASS] Requirements coverage: 100% ({n}/{n} REQ keys covered)
  [FAIL] ADRs ratified: 2 ADRs still in Proposed status (ADR-003, ADR-005)
  [PASS] Stakeholder Approval Record populated

Readiness: NOT READY — 1 check failing

Action: Ratify ADR-003 and ADR-005 before running /jupiter:handoff.
```

If any check fails, stop here. Do not produce the handoff package until all checks pass.

### Step 3 — Produce handoff manifest

Write `workspace/artifacts/handoff/handoff-{version}.yml`:

```yaml
handoff:
  initiative: "{id}"
  version: "{version}"
  date: "{ISO-8601}"
  lead_architect: "{from project.yml}"

  artifacts:
    intent: workspace/INTENT.md
    requirements: "workspace/artifacts/requirements/{id}-requirements.md"
    soap: "workspace/artifacts/design/{id}-SOAP.md"
    adrs:
      - "workspace/artifacts/design/adrs/ADR-001-{slug}.md"
      - "workspace/artifacts/design/adrs/ADR-002-{slug}.md"
      ...

  coverage:
    total_requirements: {n}
    covered: {n}
    coverage_pct: 100.0
    adrs_total: {n}
    adrs_ratified: {n}

  stakeholder_approvals:
    - name: "{from SOAP §12}"
      role: "{role}"
      decision: Approved
      date: "{date}"

  child_initiatives:
    - id: "{child-id}"
      type: "{type}"
      status: complete
      artifact: "{artifact path}"
```

### Step 4 — Emit event

Append to `workspace/log.jsonl`:
```json
{"event": "handoff_created", "ts": "{ISO-8601}", "initiative": "{id}", "version": "{version}", "coverage_pct": 100.0, "adrs_ratified": {n}}
```

### Step 5 — Print handoff summary

```
HANDOFF PACKAGE CREATED
==================================
Initiative: {id}
Version:    {version}
Date:       {ISO-8601}

Artifacts:
  Intent:        workspace/INTENT.md
  Requirements:  workspace/artifacts/requirements/{id}-requirements.md
  SOAP:           workspace/artifacts/design/{id}-SOAP.md
  ADRs ({n}):    workspace/artifacts/design/adrs/

Coverage:   100% ({n}/{n} requirements)
ADRs:       {n} ratified

Handoff manifest: workspace/artifacts/handoff/handoff-{version}.yml

The architecture handoff package is complete. Share the artifacts listed above
with the delivery team. The handoff manifest documents what was produced and
when it was approved.
```

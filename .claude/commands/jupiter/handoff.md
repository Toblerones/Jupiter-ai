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

---

## Transformation profile — variant

When the active profile is `transformation`, readiness checks and the manifest structure differ — transformation has a different artifact set (no separate requirements doc; REQs accumulate from PS resolutions; DPDs as collaborative outputs). The standard flow above remains untouched for non-transformation initiatives. Use this variant when `profile == transformation`.

### Step 1 (transformation) — Readiness check

Six checks. A FAIL on any check blocks the handoff.

**Check 1: All transformation phases complete.** Every phase in the transformation sequence (`vision`, `probe`, `converge`, `design_transformation`) has `status: complete` in the initiative file.

**Check 2: SOAP populated.** `workspace/artifacts/transformation/design/{id}-SOAP.md` exists and every required section per `templates/SOAP_template.md` is populated (re-runs the `AC-DESIGN-002` check from `design-handoff.yml`).

**Check 3: All ADRs ratified.** Every ADR file under `workspace/artifacts/transformation/design/adrs/` has `Status: Accepted` or `Status: Superseded`. No ADR remains at `Status: Proposed`.

**Check 4: All Problem Spaces closed.** Every PS file under `workspace/artifacts/transformation/problem-spaces/` has `status: closed` in the frontmatter.

**Check 5: All DPDs aligned or implemented (or explicitly deferred).** Every DPD under `workspace/artifacts/transformation/data-products/` has `status: aligned` or `status: implemented`. DPDs still at `discovering` / `drafting` are acceptable only if documented as deferred in SOAP §9.3 Dependencies with explicit rationale.

**Check 6: Migration roadmap exists.** `workspace/artifacts/transformation/design/migration-roadmap.md` exists and is populated.

### Step 2 (transformation) — Print readiness results

Same format as the standard flow, but with the six transformation checks listed.

### Step 3 (transformation) — Produce transformation handoff manifest

Write `workspace/artifacts/handoff/handoff-{version}.yml`:

```yaml
handoff:
  initiative: "{id}"
  profile: transformation
  version: "{version}"
  date: "{ISO-8601}"
  lead_architect: "{from project.yml}"

  artifacts:
    intent: workspace/INTENT.md
    capability_map: workspace/artifacts/transformation/vision/capability-map.md
    conceptual_sketch: workspace/artifacts/transformation/vision/conceptual-sketch.md   # if present
    soap: "workspace/artifacts/transformation/design/{id}-SOAP.md"
    migration_roadmap: workspace/artifacts/transformation/design/migration-roadmap.md
    adrs:
      - "workspace/artifacts/transformation/design/adrs/ADR-001-{slug}.md"
      - "workspace/artifacts/transformation/design/adrs/ADR-002-{slug}.md"
    problem_spaces:
      - id: PS-{slug}
        path: "workspace/artifacts/transformation/problem-spaces/PS-{slug}.md"
        notes: "workspace/artifacts/transformation/notes/PS-{slug}-notes.md"
        status: closed
    data_products:
      - id: DPD-{NNN}
        name: "{name}"
        path: "workspace/artifacts/transformation/data-products/DPD-{NNN}.md"
        notes: "workspace/artifacts/transformation/notes/DPD-{NNN}-notes.md"
        status: aligned | implemented | deferred
        producer: "{team / owner}"

  coverage:
    total_reqs: {n}              # REQ keys accumulated from PS OQ resolutions
    soap_addressed: {n}          # REQs addressed in SOAP §6 / §8
    adrs_total: {n}
    adrs_ratified: {n}
    problem_spaces_closed: {n}
    dpds_aligned_or_implemented: {n}
    dpds_deferred: {n}
    capabilities_covered: {n}    # in-scope capabilities from capability-map.md

  stakeholder_approvals:
    - name: "{lead architect from project.yml}"
      role: Lead Architect
      decision: Approved
      date: "{date approved via /jupiter:review}"
    - name: "{name}"
      role: Panel Reviewer ({EA|BA|DA|SA|ENG})
      decision: Endorsed | Concerns | Block
      date: "{date}"
```

### Step 4 (transformation) — Emit event

```json
{"event": "handoff_created", "ts": "{ISO-8601}", "initiative": "{id}", "profile": "transformation", "version": "{version}", "soap_complete": true, "adrs_ratified": {n}, "ps_closed": {n}, "dpds_aligned": {n}}
```

### Step 5 (transformation) — Print handoff summary

```
HANDOFF PACKAGE CREATED (TRANSFORMATION)
==================================
Initiative: {id}
Profile:    transformation
Version:    {version}
Date:       {ISO-8601}

Artifacts:
  Intent:              workspace/INTENT.md
  Capability map:      workspace/artifacts/transformation/vision/capability-map.md
  Conceptual sketch:   workspace/artifacts/transformation/vision/conceptual-sketch.md   (if present)
  SOAP:                workspace/artifacts/transformation/design/{id}-SOAP.md
  Migration roadmap:   workspace/artifacts/transformation/design/migration-roadmap.md
  ADRs ({n}):          workspace/artifacts/transformation/design/adrs/
  Problem Spaces ({n}): workspace/artifacts/transformation/problem-spaces/
  Data Products ({n}):  workspace/artifacts/transformation/data-products/

Coverage:
  REQs accumulated: {n}, addressed in SOAP: {n}
  ADRs ratified:    {n}
  PS closed:        {n}
  DPDs aligned:     {n_aligned}/{n_total}  (+{n_deferred} deferred)
  Capabilities covered: {n_covered}/{n_in_scope}

Handoff manifest: workspace/artifacts/handoff/handoff-{version}.yml

The transformation handoff package is complete. Share the artifacts above with
delivery teams. DPDs marked aligned communicate the agreed data contracts to
upstream producers for implementation. The migration roadmap captures phased
delivery dependencies.
```

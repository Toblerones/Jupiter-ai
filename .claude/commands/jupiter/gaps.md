# /jupiter:gaps — REQ key traceability check across requirements and design

Traceability gap analysis. Checks REQ key coverage across the requirements artifact, SOAP, and ADRs. Identifies requirements with no corresponding design coverage.

## Usage

```
/jupiter:gaps [--initiative <id>]
```

**Arguments:**
- `--initiative <id>` — initiative ID (auto-detected if only one active initiative exists)

---

## Execution

### Step 1 — Load requirements inventory

Load the requirements artifact at `workspace/artifacts/requirements/{id}-requirements.md`.

Extract all REQ-* keys. Build an inventory:
```
REQ-F-{DOM}-001   {description}
REQ-F-{DOM}-002   {description}
REQ-NFR-{DOM}-001 {description}
...
```

Total count: {n} requirements.

### Step 2 — Load design artifacts

Load:
- `workspace/artifacts/design/{id}-SOAP.md` (if exists)
- All `workspace/artifacts/design/adrs/ADR-*.md` files (if exist)

If no design artifacts exist yet, report that and skip to the summary.

### Step 3 — Check coverage

For each REQ-* key from the requirements inventory:
1. Search for the key in the Requirements Traceability table (§5) of the SOAP.
2. Search for the key in all ADR files (in "Requirements addressed" or inline references).
3. Record: covered (found in SOAP traceability table) | partial (found in ADRs but not SOAP traceability table) | uncovered (not found anywhere in design artifacts)

### Step 4 — Check ADR status

For each ADR file found:
- Check the Status field
- Flag any ADR still in "Proposed" status — these should be accepted or superseded before the design phase is complete

### Step 5 — Emit event

Append to `workspace/log.jsonl`:
```json
{"event": "gaps_checked", "ts": "{ISO-8601}", "initiative": "{id}", "total_reqs": {n}, "covered": {n}, "partial": {n}, "uncovered": {n}, "gap_keys": ["{REQ key}", ...]}
```

### Step 6 — Print report

```
JUPITER GAPS
==================================
Initiative: {id}

Requirements Inventory: {n} total

Coverage:
  Covered (in SOAP traceability table):  {n}  ({pct}%)
  Partial (in ADRs only):               {n}  ({pct}%)
  Uncovered (not in design artifacts):  {n}  ({pct}%)

{if uncovered > 0:}
Uncovered Requirements:
  REQ-F-{DOM}-001   {description}
  REQ-NFR-{DOM}-001 {description}
  ...
  Action: Run /jupiter:iterate to ensure these requirements are addressed in the SOAP.

{if partial > 0:}
Partially Covered (in ADRs but missing from SOAP traceability table):
  REQ-F-{DOM}-002   {description} — found in ADR-003 but not in §5 traceability table
  ...
  Action: Add these to the Requirements Traceability table in the SOAP.

ADR Status:
  {n} ADRs total
  {n} Accepted
  {n} Proposed  {if n > 0: "— these must be ratified before the design phase is complete"}
  {n} Superseded

{if all covered and no proposed ADRs:}
Coverage: complete. All {n} requirements are covered in the SOAP traceability table.
ADRs: all ratified.
Ready for /jupiter:handoff.
```

---

## Transformation profile — variant

When the active profile is `transformation`, the traceability graph differs from the standard architecture flow. There is no single requirements artifact — REQ keys are produced at OQ resolution time across multiple Problem Spaces (and may also be referenced from DPDs). The standard flow above remains untouched for non-transformation initiatives. Use this variant when `profile == transformation`.

### Step 1 (transformation) — Build the REQ inventory

REQs are scattered across PS files. Walk every PS under `workspace/artifacts/transformation/problem-spaces/`:
- For each PS, parse Section 5 (Open Questions). For each OQ with `status: resolved`, parse the Resolution column.
- Collect every REQ key referenced in `→ REQ-{TYPE}-{DOMAIN}-{SEQ}` resolution outcomes.
- For each REQ, record its source: `{PS-id, OQ-id, resolution-date}`.

Walk DPD files under `workspace/artifacts/transformation/data-products/` for any OQs that produced REQs affecting the data product spec.

Build the inventory with traceability:
```
REQ-F-{DOM}-001   {description}   source: PS-{slug} / OQ-{slug}-{NNN}
REQ-BR-{DOM}-001  {description}   source: PS-{slug} / OQ-{slug}-{NNN}
...
```

### Step 2 (transformation) — Load design artifacts

Load:
- `workspace/artifacts/transformation/design/{id}-SOAP.md` (if exists)
- All `workspace/artifacts/transformation/design/adrs/ADR-*.md` files
- `workspace/artifacts/transformation/vision/capability-map.md` (for capability coverage)

### Step 3 (transformation) — Check coverage and traceability

Three coverage checks:

**Forward (REQ → SOAP).** For each REQ in the inventory, verify it appears in the SOAP:
- Section 6 Solution Architecture (for F / BR / S types)
- Section 8 Non-Functional Architecture (for NFR types)
- Or documented deferral in Section 9.4 Phasing & Transition Notes
Mark each: `covered_in_soap` | `partial` (in ADR only) | `uncovered`.

**Backward (REQ → source).** Every REQ should have a documented source PS / OQ. REQs without a source are suspect — they appeared in the SOAP without a documented origin (potential violation of the AI-PROBE-006 context guardrail).

**Capability coverage.** For every in-scope capability in the capability map, verify at least one PS has `derived_from` referencing that capability AND that PS is closed. Capabilities flagged unclear / unknown without a covering closed PS are gaps.

### Step 4 (transformation) — Check DPD coverage

For each DPD:
- `status: aligned` or `status: implemented` → must be referenced in SOAP §6.6 Data Architecture
- `status: discovering` or `status: drafting` → must be in SOAP §9.3 Dependencies with deferral rationale

### Step 5 (transformation) — Emit event

```json
{"event": "gaps_checked", "ts": "{ISO-8601}", "initiative": "{id}", "profile": "transformation", "total_reqs": {n}, "covered_in_soap": {n}, "partial": {n}, "uncovered": {n}, "reqs_without_source": {n}, "capabilities_uncovered": {n}, "dpds_unreferenced": {n}}
```

### Step 6 (transformation) — Print report

```
JUPITER GAPS (TRANSFORMATION)
==================================
Initiative: {id}
Profile:    transformation

REQ Inventory: {n} total
  (sources: {n_PS} PSs, {n_DPD} DPDs that produced REQ resolutions)

Forward coverage (REQ → SOAP):
  Covered in SOAP:                {n}  ({pct}%)
  Partial (in ADRs only):          {n}  ({pct}%)
  Uncovered:                       {n}  ({pct}%)

Backward traceability (REQ → source):
  REQs with source PS/OQ:          {n}
  REQs without source:             {n}  {if > 0: "← suspect; investigate (potential context-guardrail violation)"}

Capability coverage:
  In-scope capabilities:           {n}
  Covered by closed PS:            {n}  ({pct}%)
  Uncovered (unclear/unknown):     {n}  {if > 0: "← unaddressed gaps"}

DPD coverage:
  DPDs aligned/implemented:        {n}  (in SOAP §6.6: {n})
  DPDs discovering/drafting:       {n}  (in SOAP §9.3: {n})
  DPDs unreferenced in SOAP:       {n}  {if > 0: "← reconcile"}

ADR Status:
  {n} total
  {n} Accepted
  {n} Proposed  {if > 0: "— must be ratified before handoff"}
  {n} Superseded

{if all covered, all traced, all capabilities covered, no proposed ADRs:}
Coverage: complete. Backward traceability: complete. Capabilities: covered.
Ready for /jupiter:handoff.
```

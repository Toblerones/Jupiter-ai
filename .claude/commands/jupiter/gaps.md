# /jupiter:gaps

Traceability gap analysis. Checks REQ key coverage across the requirements artifact, SAD, and ADRs. Identifies requirements with no corresponding design coverage.

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
- `workspace/artifacts/design/{id}-SAD.md` (if exists)
- All `workspace/artifacts/design/adrs/ADR-*.md` files (if exist)

If no design artifacts exist yet, report that and skip to the summary.

### Step 3 — Check coverage

For each REQ-* key from the requirements inventory:
1. Search for the key in the Requirements Traceability table (§5) of the SAD.
2. Search for the key in all ADR files (in "Requirements addressed" or inline references).
3. Record: covered (found in SAD traceability table) | partial (found in ADRs but not SAD traceability table) | uncovered (not found anywhere in design artifacts)

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
  Covered (in SAD traceability table):  {n}  ({pct}%)
  Partial (in ADRs only):               {n}  ({pct}%)
  Uncovered (not in design artifacts):  {n}  ({pct}%)

{if uncovered > 0:}
Uncovered Requirements:
  REQ-F-{DOM}-001   {description}
  REQ-NFR-{DOM}-001 {description}
  ...
  Action: Run /jupiter:iterate to ensure these requirements are addressed in the SAD.

{if partial > 0:}
Partially Covered (in ADRs but missing from SAD traceability table):
  REQ-F-{DOM}-002   {description} — found in ADR-003 but not in §5 traceability table
  ...
  Action: Add these to the Requirements Traceability table in the SAD.

ADR Status:
  {n} ADRs total
  {n} Accepted
  {n} Proposed  {if n > 0: "— these must be ratified before the design phase is complete"}
  {n} Superseded

{if all covered and no proposed ADRs:}
Coverage: complete. All {n} requirements are covered in the SAD traceability table.
ADRs: all ratified.
Ready for /jupiter:handoff.
```

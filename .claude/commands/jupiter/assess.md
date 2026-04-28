# /jupiter:assess

Evaluate an externally-produced artifact against the requirements baseline and project constraints. Convenience entry point: sets the assessment profile and delegates to `/jupiter:iterate`.

## Usage

```
/jupiter:assess --artifact <path> [--initiative <id>]
```

**Arguments:**
- `--artifact <path>` — required. Path to the externally-produced artifact to evaluate. Can be a requirements document, SAD, ADR, or architecture review.
- `--initiative <id>` — initiative to assess against (auto-detected if only one active exists). Determines which requirements baseline and project constraints are used.

---

## Execution

### Step 1 — Capture engagement brief

Ask:
> "In one or two sentences, what is this assessment engagement? (e.g. 'Review a SAD submitted by the payments lead against GDPR and internal policy requirements.')"

Write the response to `workspace/INTENT.md` as the Problem Statement (create the file if it does not exist, using the standard INTENT.md format with other sections left as `[To be elaborated.]`). This gives the loop agent framing for the assessment.

If `workspace/INTENT.md` already exists with a non-placeholder Problem Statement, skip the question and use the existing statement.

### Step 2 — Validate artifact

Confirm the artifact exists at the provided path. If not, error:
> "Artifact not found at {path}. Check the path and try again."

Copy the artifact to `workspace/assessment/inbox/{filename}` so the original is preserved.

### Step 3 — Determine initiative

Load the initiative file for the specified or auto-detected initiative. Verify the requirements artifact exists (the assessment needs a requirements baseline). If no requirements artifact exists, warn:
> "No requirements artifact found for initiative {id}. Assessment requires a requirements baseline to evaluate against. Run /jupiter:iterate on the requirements phase first, or provide the requirements artifact manually."

### Step 4 — Create or update assessment initiative

Check if an assessment initiative already exists for this initiative:
- Look in `workspace/initiatives/` for a file with `type: assessment` and `parent_initiative_id: {id}`
- If one exists, use it (subsequent assessment iterations)
- If none exists, create one:

```yaml
initiative:
  id: "{parent-id}-assessment-001"
  type: assessment
  title: "Assessment: {artifact filename}"
  profile: assessment
  parent_initiative_id: "{parent-id}"
  status: not_started
  created: "{ISO-8601 date}"

assessment:
  artifact_path: "workspace/assessment/inbox/{filename}"
  artifact_original_path: "{original path provided}"

phases:
  assessment:
    status: not_started
    artifact: "workspace/assessment/{parent-id}-assessment-001/findings.md"
    iteration_count: 0
    gate_result: null

context_hash: null
```

Create the output directory `workspace/assessment/{assessment-id}/` if it doesn't exist.

### Step 5 — Delegate to iterate

Invoke `/jupiter:iterate` with:
- `--initiative {assessment-id}`
- `--phase assessment`

The loop agent loads the gate config from `workflow/gates/requirements-assessment.yml`, reads the artifact from the assessment inbox, evaluates it against the requirements baseline and project constraints, and produces the findings report.

### Step 6 — Post-assessment instructions

After `/jupiter:iterate` completes, if the gate report shows status READY FOR REVIEW:

```
Assessment iteration complete.
Findings report: workspace/assessment/{assessment-id}/findings.md

When you have reviewed the findings report, run:
  /jupiter:review --initiative {assessment-id}

to record your approval and complete the assessment.
```

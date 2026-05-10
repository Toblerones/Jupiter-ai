# /jupiter:assess — Evaluate an externally-produced artifact

Evaluate an externally-produced artifact from the perspective of a Domain Solution Architect. Infers the artifact type, confirms with the architect, then routes to the appropriate gate config. Convenience entry point: sets the assessment profile and delegates to `/jupiter:iterate`.

## Usage

```
/jupiter:assess --artifact <path> [--initiative <id>]
```

**Arguments:**
- `--artifact <path>` — required. Path to the externally-produced artifact to evaluate (architecture design, engineering process document, requirements/analysis document, or similar).
- `--initiative <id>` — initiative to assess against (auto-detected if only one active exists). Determines which project constraints are used.

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

### Step 3 — Infer artifact type and confirm

Read the artifact. Based on its content, structure, and purpose, infer which of the three assessment types applies:

- **(A) Architecture/Design** — solution architecture document (SAD), architecture decision record (ADR), component map, technical design, or similar design artifact
- **(B) Engineering Process** — process definition, procedure, runbook, operating model component, deployment process, or similar procedural document
- **(C) Requirements/Analysis** — business requirements document (BRD), functional requirements, user stories, analysis document, or similar artifact that specifies what a system must do

Present your inference to the architect:

> "I've read the artifact. Based on [brief evidence — e.g. 'its component diagrams, SAD structure, and architecture decision sections'], this appears to be an **Architecture/Design** document.
>
> Please confirm the assessment type:
> **(A) Architecture/Design** — evaluate design against requirements baseline and constraints
> **(B) Engineering Process** — evaluate process completeness, roles, compliance, and operational risk
> **(C) Requirements/Analysis** — evaluate requirements quality (well-formed, testable, tech-agnostic) and coverage"

Wait for the architect's selection before proceeding.

### Step 4 — Resolve gate config path

Map the confirmed type to the gate config:
- Type A → `workflow/gates/assessment-architecture.yml`
- Type B → `workflow/gates/assessment-process.yml`
- Type C → `workflow/gates/assessment-requirements.yml`

### Step 5 — Determine initiative

Load the initiative file for the specified or auto-detected initiative.

If the confirmed type is **Architecture/Design (A)**: verify the requirements artifact exists (the architecture assessment needs a requirements baseline to evaluate against). If no requirements artifact exists, warn:
> "No requirements artifact found for initiative {id}. Architecture assessment evaluates a design against a requirements baseline. Run /jupiter:iterate on the requirements phase first, or provide the requirements artifact manually."

For types B and C, no requirements baseline is needed — proceed without the warning.

### Step 6 — Create or update assessment initiative

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
  artifact_type: "{architecture|process|requirements}"
  gate_config: "workflow/gates/assessment-{type}.yml"
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

### Step 7 — Delegate to iterate

Invoke `/jupiter:iterate` with:
- `--initiative {assessment-id}`
- `--phase assessment`
- `--gate-config {resolved gate config path from Step 4}`

The loop agent reads the artifact from the assessment inbox, applies the appropriate gate config for the confirmed artifact type, and produces the findings report.

### Step 8 — Post-assessment instructions

After `/jupiter:iterate` completes, if the gate report shows status READY FOR REVIEW:

```
Assessment iteration complete.
Findings report: workspace/assessment/{assessment-id}/findings.md

When you have reviewed the findings report, run:
  /jupiter:review --initiative {assessment-id}

to record your approval and complete the assessment.
```

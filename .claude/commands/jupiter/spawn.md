# /jupiter:spawn — Create a time-boxed child initiative (poc / discovery / spike)

Create a child initiative with a time-boxed profile to investigate a specific question. Child initiatives run independently via `/jupiter:iterate`. Findings are folded back to the parent manually.

## Usage

```
/jupiter:spawn --type <poc|discovery|spike> [--parent <id>] [--reason "<text>"] [--question "<text>"]
```

**Arguments:**
- `--type <poc|discovery|spike>` — required. Type of child initiative.
- `--parent <id>` — parent initiative ID (auto-detected if only one active initiative exists)
- `--reason "<text>"` — why this child initiative is being created
- `--question "<text>"` — for spike: the specific technical question being investigated

## Types

| Type | Purpose | Profile | Budget |
|------|---------|---------|--------|
| `discovery` | Explore an ill-defined problem space before committing to intent | discovery | 3 iterations |
| `spike` | Answer a specific technical question to inform a design decision | spike | 2 iterations |
| `poc` | Validate a technical approach with a working prototype | spike | 2 iterations (investigation report; no code governance) |

---

## Execution

### Step 1 — Determine parent

Load `workspace/initiatives/{parent-id}.yml`. If `--parent` is not provided, auto-detect the active initiative. If multiple initiatives exist, ask the architect to specify.

### Step 2 — Generate child initiative ID

Format: `{parent-id}-{type}-{seq}` where seq is `001` incremented from existing children.

Example: if parent is `myproject-001` and this is the first spike, the child is `myproject-001-spike-001`.

### Step 3 — Create child initiative file

Write `workspace/initiatives/{child-id}.yml`:

```yaml
initiative:
  id: "{child-id}"
  type: "{type}"
  title: "{reason or question}"
  profile: "{type}"  # uses the profile matching the type
  parent_initiative_id: "{parent-id}"
  status: not_started
  created: "{ISO-8601 date}"

purpose:
  reason: "{reason argument}"
  question: "{question argument, or null}"  # spike only

phases:
  intent:
    status: not_started
    artifact: "workspace/artifacts/spawn/{child-id}-{type}.md"
    iteration_count: 0
    gate_result: null

context_hash: null
```

### Step 4 — Create a starter artifact

Create a starter document at `workspace/artifacts/spawn/{child-id}-{type}.md`:

For **discovery**:
```markdown
# Discovery: {reason}

Parent initiative: {parent-id}

## Exploration Focus

{reason}

## Known Questions

- {List the questions this discovery initiative should answer}

## Investigation Notes

[The loop agent will populate this section.]

## Findings

[The loop agent will populate this section.]

## Open Questions

[The loop agent will populate this section.]

## Recommended Next Steps

[The loop agent will populate this section.]
```

For **spike**:
```markdown
# Spike: {question}

Parent initiative: {parent-id}

## Question

{question}

## Investigation Approach

[Describe how the investigation will be conducted.]

## Findings

[The loop agent will populate this section.]

## Recommendation

[The loop agent will populate this section — a specific recommended decision.]

## ADR Input

[Key points for the ADR this spike will inform, in the parent initiative.]

## Confidence Level

[The loop agent will assess confidence in the recommendation.]
```

For **poc** (proof of concept):
```markdown
# Proof of Concept: {reason}

Parent initiative: {parent-id}

## Hypothesis

{reason — what is being validated}

## Validation Approach

[How the PoC will validate or invalidate the hypothesis.]

## Results

[The loop agent will populate this section.]

## Recommendation

[The loop agent will populate this section.]

## Implications for Parent Initiative

[Key findings and their design implications for {parent-id}.]
```

### Step 5 — Emit event

Append to `workspace/log.jsonl`:
```json
{"event": "initiative_spawned", "ts": "{ISO-8601}", "parent_id": "{parent-id}", "child_id": "{child-id}", "child_type": "{type}", "reason": "{reason}"}
```

### Step 6 — Print summary

```
Child initiative created: {child-id}
Type:    {type}
Parent:  {parent-id}
Reason:  {reason}
Profile: {type} ({budget} iteration budget)

The child initiative runs independently.

Next steps:
  1. Edit the starter document: {artifact path}
  2. Run /jupiter:iterate --initiative {child-id} to begin.
  3. When complete, review findings and fold them back to the parent initiative manually.

To fold back findings:
  - For a spike: create an ADR in workspace/artifacts/design/adrs/ citing the spike report.
  - For a discovery: update workspace/INTENT.md or the requirements artifact with new understanding.
  - For a poc: update the relevant design decision or open issue in the parent SAD.
```

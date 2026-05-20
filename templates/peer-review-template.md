# Peer Review — {initiative} / {phase} / peer-{n}

---
peer_review_id:  peer-{n}
initiative:      {id}
phase:           {phase}
timestamp:       {ISO-8601}
model:           {self-reported model id — e.g. claude-sonnet-4-6, claude-opus-4-7}
session_note:    "{optional architect label — e.g. 'opus session', 'fast mode', 'second opinion'}"
---

## Context Loaded

- Artifact:           {path to artifact reviewed}
- Gate criteria:      {path to gate config used}
- Gate report:        {path to gate report challenged}
- Context files:      {list of context files loaded — project.yml, constraint-dimensions.yml, policy/, standards/, adrs/, glossary/, etc.}
- Prior peer reviews: {list of peer-*.md files read, or "none"}

---

## Gate Report Assessment

### Agreement

Checks in the gate report this session independently confirms:

| Check ID | Result in gate report | This session's finding |
|----------|-----------------------|------------------------|
| {id}     | PASS / FAIL           | Confirmed — {brief reason} |

### Challenger

Checks where this session reached a different conclusion:

| Check ID | Result in gate report | This session's finding | Reasoning |
|----------|-----------------------|------------------------|-----------|
| {id}     | PASS                  | DISAGREE — should FAIL | {specific gap the first session missed} |
| {id}     | FAIL                  | DISAGREE — should PASS | {why this session considers it passing} |

### Additional Gaps

Gaps this session found that the gate report did not flag (not covered by any existing check):

- {description of gap, specific and actionable}
- {description of gap}

*(Omit section entirely if no additional gaps found)*

---

## Verdict

`CONCUR` | `PARTIAL` | `DISSENT`

- **CONCUR** — gate report conclusions are correct; no material disagreement
- **PARTIAL** — gate report is mostly correct but missed one or more gaps
- **DISSENT** — gate report conclusions are materially wrong; artifact is not in the state the gate report claims

### Reasoning

{One paragraph. Summarise the overall assessment — what this session agrees with, what it challenges, and the significance of any gaps found. Be specific.}

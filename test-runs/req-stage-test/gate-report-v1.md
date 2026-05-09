# Gate Report — requirements-v1.md
## Simulated /jupiter:iterate output (intent → requirements)

```
JUPITER — Requirements | Iteration 1
====================================
Initiative: invoice-modernisation
Phase:      requirements
Profile:    architecture

Auto Checks:   5/5 required passing
  [PASS] AC-IR-001  problem_statement_complete
  [PASS] AC-IR-002  stakeholder_map_present
  [PASS] AC-IR-003  scope_boundary_documented
  [PASS] AC-IR-004  req_keys_assigned
  [PASS] AC-IR-005  req_types_valid

AI Checks:     4/12 required passing
  [FAIL] AI-IR-SA-001  intent_ambiguities_documented
                       — No "Source Analysis" section in artifact. Intent
                         contains undisclosed ambiguities ("modernise",
                         "users", "frustration", "compliance pressures")
                         that the agent silently interpreted.
  [FAIL] AI-IR-SA-002  intent_gaps_documented
                       — No "Gaps" subsection. Intent does not name approver
                         or supplier roles, has no measurable success
                         criteria, no integration constraints beyond Sage —
                         all silently filled by the agent.
  [FAIL] AI-IR-SA-003  intent_speculative_content_documented
                       — Speculative content ("investigate whether AI could
                         help") was force-fit as REQ-F-AI-001. It should
                         have been flagged with spawn-discovery
                         recommendation, not converted to a requirement.
  [PASS] AI-IR-001     problem_statement_coherent
  [PASS] AI-IR-002     scope_does_not_contradict_constraints
  [PASS] AI-IR-003     requirements_consistent
  [PASS] AI-IR-004     regulatory_requirements_captured
  [FAIL] AI-IR-005     requirements_business_framed
                       — REQ-F-AI-001 is an architecture/technology choice
                         ("use AI to classify and extract"), not a business
                         capability. Rewrite as what a person can now do.
  [PASS] AI-IR-006     traces_to_intent
  [FAIL] AI-IR-007     intent_aspects_covered
                       — Intent's "Fewer errors that result in payment
                         delays" outcome has no covering REQ. Known
                         Constraint "must integrate with Sage" has no REQ.
                         Two intent aspects silently dropped.
  [FAIL] AI-IR-008     nfr_acceptance_measurable
                       — REQ-NFR-PERF-001 acceptance is "Performance should
                         be appropriate for the user load" — no threshold.
                         REQ-NFR-SCALE-001 acceptance is "System scales as
                         needed" — no threshold. Both unfalsifiable.
  [FAIL] AI-IR-009     language_discipline
                       — REQ-F-INV-001 combines "submit and approve"
                         (compound — split into two REQs).
                         REQ-F-INV-002, REQ-NFR-PERF-001, REQ-NFR-SCALE-001
                         use "should" (vague modal — use "must"/"shall").
                         REQ-NFR-PERF-001 uses "appropriate" without a
                         measurable criterion.

Human Gate:    PENDING — run /jupiter:review when auto and AI checks pass

Gap:    8 required checks failing
Status: LOOPING

Next: produce a Source Analysis section with three subsections (Ambiguities,
Gaps, Speculative Content). Move REQ-F-AI-001 into the Speculative Content
subsection with spawn-discovery recommendation. Add coverage for the missed
intent aspects. Add measurable thresholds to all NFRs. Rewrite "should" as
"must" and split REQ-F-INV-001 into submit and approve.
```

---

## Per-check reasoning trace

### AI-IR-SA-001 (intent_ambiguities_documented) — FAIL
**Required**: Source Analysis → Ambiguities subsection exists, lists every ambiguous intent term with the chosen interpretation.
**Found in artifact**: No Source Analysis section at all.
**Concrete ambiguities the agent silently resolved**:
- "modernise" → could mean automation, redesign, retire-and-replace
- "users" → who? clerks only? approvers? suppliers? auditors?
- "frustration" → what specifically frustrates them?
- "compliance pressures" → beyond GDPR, what else?

### AI-IR-SA-002 (intent_gaps_documented) — FAIL
**Required**: Gaps subsection naming intent gaps with disposition.
**Concrete gaps the agent should have flagged**:
- Stakeholder gap: approvers, suppliers, auditors not named
- NFR gap: no measurable thresholds for "faster", "fewer errors", "growing volume"
- Integration gap: only Sage named — but landscape may have more

### AI-IR-SA-003 (intent_speculative_content_documented) — FAIL
**Required**: Speculative Content subsection with recommendations.
**Found**: REQ-F-AI-001 force-fits "investigate whether AI could help" as a hard requirement. The intent itself uses "investigate whether" — explicitly exploratory.
**Correct treatment**: Flag in Speculative Content subsection with `spawn-discovery` recommendation. Do not produce a REQ until discovery answers the feasibility question.

### AI-IR-005 (requirements_business_framed) — FAIL
**REQ-F-AI-001** is "The system must use AI to..." — that's a technology decision, not a user/business outcome. Rewrite would be: *"Finance clerks can submit invoices without manually rekeying line-item data"* — leaves the AI/no-AI choice to design.

### AI-IR-007 (intent_aspects_covered) — FAIL
**Coverage matrix**:
| Intent aspect | Covered by |
|---|---|
| Faster invoice turnaround | REQ-F-INV-001, REQ-NFR-PERF-001 |
| Fewer errors that result in payment delays | **NONE** |
| Better visibility into invoice status | REQ-F-INV-002 |
| Stay compliant with supplier data handling | REQ-C-GDPR-001 |
| Handle growing volume without proportional headcount | REQ-NFR-SCALE-001 |
| Constraint: GDPR | REQ-C-GDPR-001 |
| Constraint: Sage integration | **NONE** |

Two aspects uncovered → fails.

### AI-IR-008 (nfr_acceptance_measurable) — FAIL
- **REQ-NFR-PERF-001**: "Performance should be appropriate for the user load" — no number, no unit, no falsifiable condition.
- **REQ-NFR-SCALE-001**: "System scales as needed" — same issue.

Bootloader axiom violated: *"a constraint without a tolerance is a wish"*. Wishes cannot drive design or detect production drift.

### AI-IR-009 (language_discipline) — FAIL
- **REQ-F-INV-001**: "submit **and** approve" — compound (two distinct behaviours, must split). Plus a hidden BR (approver ≠ submitter) lurks behind this.
- **REQ-F-INV-002**: "**should** provide visibility" — vague modal.
- **REQ-NFR-PERF-001**: "**should** be fast", "**appropriate**" — vague modal + subjective qualifier.
- **REQ-NFR-SCALE-001**: "**should** handle" — vague modal.

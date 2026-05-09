# Gate Report — requirements-v2.md
## Simulated /jupiter:iterate output (intent → requirements)

```
JUPITER — Requirements | Iteration 2
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

AI Checks:     12/12 required passing
  [PASS] AI-IR-SA-001  intent_ambiguities_documented
                       — Source Analysis → Ambiguities lists 4 items with
                         chosen interpretation and reason. One flagged for
                         architect confirmation.
  [PASS] AI-IR-SA-002  intent_gaps_documented
                       — 3 gaps documented with disposition (assumed-here,
                         will-ask-architect, defer-to-design).
  [PASS] AI-IR-SA-003  intent_speculative_content_documented
                       — "Investigate whether AI..." flagged with
                         spawn-discovery recommendation, not converted to
                         a REQ. Out-of-scope updated accordingly.
  [PASS] AI-IR-001     problem_statement_coherent
  [PASS] AI-IR-002     scope_does_not_contradict_constraints
  [PASS] AI-IR-003     requirements_consistent
  [PASS] AI-IR-004     regulatory_requirements_captured  (REQ-C-GDPR-001/002)
  [PASS] AI-IR-005     requirements_business_framed
                       — All F-type REQs describe what users/business can
                         do. No technology choices baked in.
  [PASS] AI-IR-006     traces_to_intent
  [PASS] AI-IR-007     intent_aspects_covered
                       — All 5 desired outcomes covered. Both active known
                         constraints (GDPR, Sage) covered. Speculative AI
                         content explicitly out-of-scope with reason.
  [PASS] AI-IR-008     nfr_acceptance_measurable
                       — REQ-NFR-PERF-001: p95 < 3000ms at 50 concurrent.
                         REQ-NFR-SCALE-001: 1500/month, peak 150/day.
                         REQ-NFR-ERR-001: < 2% over 30-day window.
                         All three have thresholds, units, measurement
                         windows, and falsifiable conditions.
  [PASS] AI-IR-009     language_discipline
                       — All REQs use "shall". REQ-F-INV-001 (submit) and
                         REQ-F-INV-002 (approve) split out of the original
                         compound. REQ-BR-INV-001 captures the segregation
                         of duties rule that was implicit in v1.

Human Gate:    PENDING — run /jupiter:review when ready

Gap:    0 required checks failing
Status: READY FOR REVIEW

Next: present the requirements artifact to the business owner (Sarah Chen)
and lead architect (Raj Patel) for sign-off via /jupiter:review. Note for
review: one ambiguity ("frustration") is flagged for architect confirmation;
NFR thresholds are agent-proposed and need stakeholder validation.
```

---

## Coverage matrix (used to evaluate AI-IR-007)

| Intent aspect | Covered by |
|---|---|
| Faster invoice turnaround | REQ-F-INV-001, REQ-F-INV-002, REQ-NFR-PERF-001 |
| Fewer errors that result in payment delays | REQ-F-INV-001, REQ-F-INV-002, REQ-BR-INV-001, REQ-NFR-ERR-001 |
| Better visibility into invoice status | REQ-F-INV-003 |
| Stay compliant with supplier data handling | REQ-C-GDPR-001, REQ-C-GDPR-002 |
| Handle growing volume without proportional headcount | REQ-NFR-SCALE-001 |
| Constraint: GDPR | REQ-C-GDPR-001, REQ-C-GDPR-002 |
| Constraint: Sage integration | REQ-F-INV-004 |
| Speculative: AI-assisted classification | Out-of-scope (spawn-discovery) — explicitly recorded |

All aspects accounted for.

## Diff: what fixed each failure

| v1 failure | v2 fix |
|---|---|
| AI-IR-SA-001 | Added Source Analysis → Ambiguities (4 items) |
| AI-IR-SA-002 | Added Source Analysis → Gaps (3 items with disposition) |
| AI-IR-SA-003 | Speculative content moved to subsection with spawn-discovery + out-of-scope |
| AI-IR-005 | Removed REQ-F-AI-001 (was a tech choice); replaced via discovery initiative |
| AI-IR-007 | Added REQ-F-INV-004 (Sage), REQ-NFR-ERR-001 (errors); coverage matrix verified |
| AI-IR-008 | All 3 NFRs given thresholds, units, measurement windows |
| AI-IR-009 | Split submit/approve into REQ-F-INV-001/002; "should"→"shall" everywhere; "appropriate"/"as needed" replaced with measurable criteria |

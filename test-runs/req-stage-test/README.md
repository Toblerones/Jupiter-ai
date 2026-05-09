# Requirements Stage Test — New Gate Checks

Self-contained test rig for the six new AI checks added to
`workflow/gates/intent-requirements.yml`:
- AI-IR-SA-001 / 002 / 003 (source analysis: ambiguities, gaps, speculative content)
- AI-IR-007 (intent aspects covered — backward coverage)
- AI-IR-008 (NFR acceptance measurable — tolerance enforcement)
- AI-IR-009 (language discipline — modals + compounds)

## Files

| File | Role |
|---|---|
| `INTENT.md` | Deliberately imperfect intent designed to exercise every new check |
| `requirements-v1.md` | What an under-instructed agent would produce (fails) |
| `gate-report-v1.md` | Simulated gate output — 8/12 AI checks failing |
| `requirements-v2.md` | What a properly-guided agent should produce (passes) |
| `gate-report-v2.md` | Simulated gate output — 12/12 AI checks passing |

## What the intent deliberately contains

| Defect type | Where in INTENT.md |
|---|---|
| Ambiguities | "modernise", "users", "frustration", "compliance pressures" |
| Gaps | No measurable thresholds; approver/supplier roles unnamed; integration scope vague |
| Speculative content | "investigate whether AI could help classify or extract" |
| Cross-cutting | Outcomes phrased as "faster", "fewer", "better" — none measurable |

## How to read this

1. Start with `INTENT.md` — note the deliberate imperfections.
2. Open `requirements-v1.md` next to `gate-report-v1.md`. Each FAIL line in
   the report cites the specific REQ and the rule it violates.
3. Open `requirements-v2.md` next to `gate-report-v2.md`. Each fix maps back
   to a v1 failure (see the diff table at the bottom of the v2 report).

## What this test confirms

- Source analysis defects (silent disambiguation, dropped speculation) are
  caught — they were invisible before the new checks.
- Intent-side coverage gaps (REQ for "fewer errors" missing, Sage integration
  missing) are caught by AI-IR-007 — previously masked because AI-IR-006 only
  checked the forward direction.
- Vague NFRs ("fast", "as needed") fail AI-IR-008 with a falsifiability
  argument — bringing Jupiter's NFR discipline up to the GENESIS bootloader's
  tolerance axiom.
- Compound REQs and vague modals are caught by AI-IR-009 — matches GENESIS's
  `no_compound_requirements` and `no_ambiguous_language`.

## Notes on the test method

This is a **paper simulation** of `/jupiter:iterate`, not an actual run.
Running it for real requires a Jupiter workspace with `project.yml`, an
initiative file, the activity log, and `/jupiter:start` having been invoked.
The simulation manually applies every check from `intent-requirements.yml`
to the artifact and records the result the loop agent would have produced.
The shape of the gate report block matches the format in `agents/loop.md`.

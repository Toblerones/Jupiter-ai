# /jupiter:present — Project the governed model into a human-facing presentation

Project an initiative's governed artifacts into a self-contained, audience-shaped HTML presentation. Loads the whole model as context, features only what the brief's ask calls for, preserves truth-state, and renders in the house style.

The presentation is a **derived projection** — read-only, never hand-edited. Regenerate any time; edit the model, not the deck.

Thin dispatcher: validate → resolve brief → load model + house style → invoke the render agent → write event → report.

## Usage

```
/jupiter:present [--audience <name>] [--brief "<intent>"] [--initiative <id>] [--name <slug>]
```

**Arguments:**
- `--audience <name>` — a common audience preset that shapes selection, altitude, and tone. A starting menu, not a fixed set (guided-freeform):
  - `steering` — sponsor / board: the story, cost, risk, and the decision asked of them.
  - `arb` — peer architects: decisions, alternatives, target-architecture fit.
  - `delivery` — build teams: components, dependencies, sequencing, what's ready.
  - `approach` — how the architecture is being worked: the method, evidenced by the project.
  - `walk` — mid-flight architect view: settled vs open, side by side, everything navigable.
- `--brief "<intent>"` — freeform presentation brief in the architect's own words: who is looking, why, and the one thing it must land. Augments or overrides the preset. **Either `--audience` or `--brief` is required.**
- `--initiative <id>` — initiative to project (auto-detected if only one active exists).
- `--name <slug>` — output filename slug (default: `{initiative}-{audience}-{YYYY-MM-DD}`).

---

## Execution

### Step 1 — Resolve initiative and profile

Load `workspace/initiatives/{id}.yml` (auto-detect if only one active). Note its `profile` — it determines the artifact set to load in Step 3.

### Step 2 — Resolve the brief (the composition spec)

The brief is the ask that drives the projection: **target · purpose · thesis · selection · sequence**.
- If `--brief` is given, use it as the thesis / intent.
- If `--audience` is given, expand the preset into a working brief (audience, purpose, altitude, what to feature vs suppress).
- If neither is given, ask:
  > "Who is this presentation for, and what is the one thing it needs to land? (e.g. 'The board — we've de-risked the close; direct tax needs one decision.')"

The brief **selects from** the model; it is not a manual pick-list. Most of the loaded model will inform the projection without being featured.

### Step 3 — Load the whole model as context (load-all, feature-per-ask)

Load the initiative's full governed artifact set — **everything**, as the guardrail that keeps the projection honest. Profile-aware (paths per the workspace layout in `CLAUDE.md`):
- **transformation** — `INTENT.md`, `vision/capability-map.md`, the living SOAP, all `problem-spaces/PS-*.md`, all `design/adrs/ADR-*.md`, `design/migration-roadmap.md` (if present), `data-products/DPD-*.md`.
- **architecture** (standard) — `INTENT.md`, `requirements/{id}-requirements.md`, `design/{id}-SOAP.md`, all `design/adrs/ADR-*.md`.

Also load `templates/presentation-house-style.md` (the house style + render rules).

Loading everything is what makes truth-preservation possible: you need the whole model to state "3 of 4 settled" honestly, and to know an open item is open.

### Step 4 — Invoke the render agent

Invoke `agents/render.md` with the resolved brief, the loaded model, and the house style. It composes one storyline (thesis-first), selects and sequences across artifacts (many→one), preserves truth-state, renders self-contained HTML in the house style, uses a diagram where the information is relational, and strips all internal (Jupiter) language and keys.

It writes: `workspace/artifacts/presentation/{name}.html` (create the `presentation/` directory if absent).

### Step 5 — Truth-check (the governed floor)

The render agent self-verifies before returning: every claim on the face traces to a model element, and no `open` element is rendered as settled. Capture its internal trace note. This is the governed half — the storyline itself is the architect's to judge (Step 7).

### Step 6 — Emit event

Append to `workspace/log.jsonl`:
```json
{"event": "presentation_created", "ts": "{ISO-8601}", "initiative": "{id}", "audience": "{audience|custom}", "path": "workspace/artifacts/presentation/{name}.html", "featured": {n}, "truth_check": "pass"}
```

### Step 7 — Print summary

```
PRESENTATION CREATED
==================================
Initiative: {id}
Audience:   {audience | custom brief}
File:       workspace/artifacts/presentation/{name}.html   (self-contained HTML)

Featured (from the whole model):
  {short list of what the storyline surfaced}
Held as context, not shown:
  {note that the rest of the model informed the projection but wasn't featured}

Truth-check: PASS — every claim traces to the model; no open item shown as settled.

This is a derived projection. Review the STORYLINE — the thesis, what's featured, the
sequence — that part is yours to judge. The truth of each claim is inherited from the
model. To change it, edit the model and regenerate; never hand-edit the file.
```

---

## Notes

- **Not a governed phase artifact.** `present` produces a deliverable, not a gated phase output — it needs no human gate. Governance is split: the render agent mechanically preserves truth-state (Step 5); the architect judges the storyline (Step 7).
- **Two lifecycle modes.** A *living view* — regenerate on demand, disposable. A *snapshot* — a dated point-in-time deliverable kept as a record. Same command; a stable `--name` slug marks a kept snapshot.
- **Read-only projection.** The house style, truth-preservation, provenance-internal, and no-internal-language rules are the render agent's discipline (`agents/render.md`). Presentations are never hand-maintained — that would fork the deck from the model, the same failure the derived SOAP avoids.

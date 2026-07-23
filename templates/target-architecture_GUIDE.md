# Guide — Converting a Conceptual / Target State Diagram into Target Architecture Files

This guide explains how to turn a drawn target-state architecture (a diagram of
boxes, arrows, groupings, and annotations) into the structured target-architecture
files that Jupiter loads as a **guardrail** in the transformation profile.

These files live under `workspace/context/target-architecture/` and are loaded
on every iteration of every transformation phase. They are the authoritative
statement of what we are building toward — *architecture-led* means this is the
thing that leads. Everything downstream (Problem Space strawmans, OQ resolutions,
ADRs, the SOAP) is checked for alignment against them.

Use this guide with `templates/target-architecture_template.md`.

---

## 1. The two ideas that make this "feasible but strict"

- **Folder is flat. Semantics carry the hierarchy.** All files sit side by side
  in one folder — no nested directories. The architectural altitude is declared
  in frontmatter (`level`, `scope`, `parent`), not in folder structure. This is
  the same mechanism the Problem Space files use.

- **Altitude is intrinsic, not imposed.** A domain-level target and a
  capability-level target are different *zoom levels* of the same architecture
  (C4-style), not org silos. Model the levels; bind each one to the capability
  map so it stays anchored.

The result: you add a finer-grained file **only when that grain actually has its
own target state**, and every file is anchored to a capability key and a parent,
so nothing floats free.

---

## 2. Choose the altitude of the diagram you are converting

Before converting, decide what the diagram *is*:

| The diagram shows…                                  | `level`      | `scope`            | `parent`        |
|-----------------------------------------------------|--------------|--------------------|-----------------|
| The whole domain's target state (e.g. all of FM)    | `domain`     | domain code (`FM`) | `null`          |
| A grouping between domain and a single capability   | `sub-domain` | the `CAP-{NNN}` it heads | parent TA id |
| One business capability's own target (e.g. e-invoicing) | `capability` | its `CAP-{NNN}`  | parent TA id    |

One diagram → one file. If a single drawing actually contains two altitudes
(a domain overview *and* a blown-up capability), split it into two files (see §5).

---

## 3. Map the diagram elements to template sections

Work element-by-element — this is mechanical, which is the point:

| Diagram element                          | Goes to template section                          |
|------------------------------------------|---------------------------------------------------|
| **Box / node**                           | §3 Building Blocks — one row, with a 1-line responsibility |
| **Arrow / connector**                    | §4 Relationships & Flows — one row, with what flows + direction |
| **Grouping / swimlane / container**      | §6 Boundaries (and possibly its own child file — §5) |
| **Label / annotation / legend / note**   | §5 Principles & Constraints, or §8 Assumptions    |
| **Title / overall intent**               | §1 Scope & Altitude + §2 Conceptual Overview      |
| **The picture itself**                   | §7 Diagram (re-draw as Mermaid, or reference the source file) |

Two rules while mapping:

1. **Bind every block to a capability.** For each box, find the matching
   `CAP-{NNN}` in `vision/capability-map.md` and record it in the "Maps to CAP"
   column. If a block has no capability, write `— (no CAP; conceptual only)` and
   treat that as a prompt: is a capability missing from the map?

2. **Stay conceptual; flag committed technology.** A conceptual target describes
   responsibilities, not products. If the diagram already names a product or
   technology, don't drop it — record it as a constraint in §5
   (e.g. `TA-FM-P3: posting is performed in the Fusion GL`) so the commitment is
   explicit and checkable, not buried in a box label.

---

## 4. Turn annotations into checkable principles

The most valuable output is §5 Principles & Constraints, because that is what the
downstream alignment checks actually test. When you convert an annotation, phrase
it as a statement a strawman or SOAP section could *violate*:

- Weak (un-checkable): "Tax should be handled well."
- Strong (checkable): `TA-FM-P1: Tax determination is centralised; no domain
  computes tax independently of the tax engine.`

Give each one a key (`TA-{SCOPE}-P{n}`) so a PS, ADR, or SOAP section can cite it.

---

## 5. Decide where to split into a finer-grained file

Split a block out into its own `capability`-level file when **any** of these holds:

- The block has its own detailed diagram (a blow-up exists).
- The block carries materially more target detail than its siblings.
- The block has a distinct owner / stakeholder set and will be reasoned about on
  its own (e.g. e-invoicing has its own clearance model and its own SME group).

When you split:

1. Create a new file with `level: capability`, `scope: CAP-{NNN}` (the real key),
   `parent:` set to the file you split it out of.
2. In the **parent** file, keep the block as a single row in §3 and list the
   child in §9 Refinements.
3. In the **child** file, §1 states which parent block it refines.

Do **not** split pre-emptively. A block with no extra detail stays a row in the
parent. Grain is added only where it exists — that is the "feasible" half.

---

## 6. Who converts, and when it becomes a guardrail

Target-architecture files are **architect-owned authoritative context**, like
`policy/` and `standards/`. You prepare them; the loop consumes them as a
guardrail but never authors or rewrites them.

- **Preparation, not a loop step.** Converting the diagram is a preparation
  activity you do before Vision can complete — the same way you drop documents
  into `policy/`. Use this guide as the recipe; you can ask Claude to help with
  the mechanical conversion, but the output is yours to own and approve.
- **It becomes a guardrail when you mark it authoritative.** While drafting, a
  file carries `status: draft` and is not yet treated as a guardrail. When you
  are satisfied, set `status: authoritative`. From that point downstream phases
  consume it on every iteration and never silently rewrite it — outputs are
  bound by it. This preserves the context-driven principle: outputs are bound by
  authoritative context, not by free text.

**When the diagram changes**, re-convert: update the file, bump `last_updated`,
and re-accept. Don't let the file and the picture drift — `source_diagram`
records which diagram this file reflects.

---

## 7. Strictness checklist (run before setting status: authoritative)

A file is not a valid guardrail until all of these hold (these mirror the
Vision gate checks AC-VISION-006/007 and AI-VISION-004):

- [ ] `level`, `scope`, `parent` are all set, consistent with §2 of this guide.
- [ ] Domain-level file exists for the domain this initiative targets.
- [ ] Every `capability` / `sub-domain` file's `scope` references a **real**
      `CAP-{NNN}` present in the capability map.
- [ ] Every non-domain file's `parent` names an **existing** TA file. No orphans.
- [ ] The child does **not contradict** its parent (it may add or refine detail
      only). Where it appears to, reconcile before accepting.
- [ ] Every block in §3 either maps to a CAP or is explicitly flagged as
      conceptual-only.
- [ ] §5 principles are phrased as checkable statements with keys.

---

## 8. How the guardrail is used downstream (so you know what "strict" buys you)

Once authoritative, alignment is checked at each transition using
**most-specific-wins** resolution:

- A PS strawman, OQ resolution, ADR, or SOAP section that touches a capability is
  checked against that capability's TA file **first** (the governing target),
  and against the parent domain TA as the umbrella it must remain consistent with.
- If no capability-level file exists for the area, the domain-level TA governs.

This is the payoff over narrating the architecture into INTENT: the target is
re-asserted as a constraint on every iteration, not stated once and forgotten.

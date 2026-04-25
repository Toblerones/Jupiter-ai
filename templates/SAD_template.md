# Solution Architecture Document (SAD)

<!-- Metadata — update all fields before human gate review -->

| Field          | Value                                                          |
|----------------|----------------------------------------------------------------|
| Initiative     | [REPLACE WITH initiative-id]                                   |
| SAD Version    | [REPLACE WITH version, e.g. 0.1.0-draft]                      |
| Date           | [REPLACE WITH date of this version, ISO 8601]                  |
| Lead Architect | [REPLACE WITH full name]                                       |
| Status         | draft \| in_review \| approved \| superseded                   |

---

## 1. Executive Summary

*1–2 paragraphs summarising what was decided and why. Written for stakeholders who will read nothing else. Must answer: what is being built or changed, what is the primary architectural approach, and what are the most important trade-offs made.*

[REPLACE WITH a concise summary of the architectural decision. State the problem being solved, the architectural approach selected, and the key reasons for that choice. Reference the most significant ADRs by name if helpful.]

---

## 2. Business Context and Drivers

### 2.1 Business Problem

[REPLACE WITH a clear statement of the business problem this architecture addresses. Be specific.]

### 2.2 Strategic Context

[REPLACE WITH how this initiative fits into the organisation's broader goals or technology strategy.]

### 2.3 Regulatory and Compliance Context

[REPLACE WITH applicable regulations, standards, and compliance obligations. If none apply, state explicitly: "No regulatory obligations apply to this initiative."]

### 2.4 Key Business Drivers

[REPLACE WITH a bulleted list of the primary drivers. Each driver should be concrete and attributable.]

---

## 3. Scope and Boundaries

### 3.1 In Scope

[REPLACE WITH an explicit list of what this architecture covers. Name systems, components, integrations, and data domains within scope.]

### 3.2 Out of Scope

[REPLACE WITH an explicit list of what this architecture does NOT cover.]

### 3.3 System Context

[REPLACE WITH a description of external systems, actors, and data flows interacting with the system. A Mermaid diagram is recommended.]

---

## 4. Solution Component Map

*The architect's translation of business requirements into architecture building blocks. Every REQ-* key from the requirements artifact is assigned to at least one component. ASR identification happens here — at the component level. This section is the primary input to the Target State (§8).*

*Coverage gate: every REQ-* key must appear in at least one component's Satisfies list.*

### COMP-001: {Component Name}

**Responsibility**: {One sentence — what this component does in the system}

**Satisfies**:
- REQ-{TYPE}-{DOMAIN}-{SEQ}: {brief requirement title}

**Architecturally Significant**: true | false

**ASR Justification**: {If true — why this component has structural impact. If false — omit.}

**Design Questions**:
- {Unresolved decision → candidate ADR}

---

*[Add a COMP-NNN section for each solution component. Every REQ-* key must appear in at least one Satisfies list.]*

**Component coverage summary:**
- Total REQ-* keys: [REPLACE WITH count]
- Covered by components: [REPLACE WITH count]
- Uncovered: [REPLACE WITH list, or "None — full coverage achieved"]

---

## 5. Requirements Traceability

*Coverage table mapping every REQ-* key to its component and where it is addressed in this SAD.*

| REQ Key            | Description                              | Type | Component  | Addressed In                |
|--------------------|------------------------------------------|------|------------|-----------------------------|
| REQ-F-{DOM}-001    | [REPLACE WITH requirement description]   | F    | COMP-001   | §8.2 Target State / ADR-001 |
| REQ-NFR-{DOM}-001  | [REPLACE WITH requirement description]   | NFR  | COMP-002   | §8.6 Operational / ADR-002  |
| REQ-BR-{DOM}-001   | [REPLACE WITH requirement description]   | BR   | COMP-001   | §8.2 Target State           |
| REQ-C-{DOM}-001    | [REPLACE WITH requirement description]   | C    | COMP-003   | §8.5 Security / ADR-003     |
| REQ-S-{DOM}-001    | [REPLACE WITH requirement description]   | S    | COMP-003   | §8.5 Security / ADR-003     |

*Add a row for every REQ-* key. Row count must match the total requirement count.*

**Coverage summary:**
- Total requirements: [REPLACE WITH count]
- Requirements addressed: [REPLACE WITH count]
- Coverage: [REPLACE WITH percentage]
- Uncovered keys: [REPLACE WITH list, or "None — full coverage achieved"]

---

## 6. Architecture Principles

### 6.1 Inherited Principles

[REPLACE WITH architecture principles from workspace/context/project.yml. If none defined, state explicitly.]

### 6.2 Initiative-Specific Principles

[REPLACE WITH any principles specific to this initiative. If none, state explicitly.]

---

## 7. Current State (As-Is)

### 7.1 Current Architecture Overview

[REPLACE WITH a description of the current architecture. If greenfield: "This is a greenfield initiative. There is no current architecture for this scope."]

### 7.2 Pain Points and Limitations

[REPLACE WITH specific pain points this initiative addresses. If greenfield, describe the gap being filled.]

### 7.3 Constraints Carried Forward

[REPLACE WITH constraints from the current architecture the new design must respect. If none, state explicitly.]

---

## 8. Target State (To-Be)

*Each component from §4 is described here. Every ASR-flagged component must receive a specific architectural response — not merely a mention.*

### 8.1 Architecture Overview

[REPLACE WITH a high-level description of the target architecture. State the primary architectural patterns. A Mermaid diagram is strongly recommended.]

### 8.2 Component Architecture

*One subsection per solution component from §4.*

#### 8.2.1 COMP-001: {Component Name}

[REPLACE WITH the architectural design for this component — how it is built, what technology it uses, how it interfaces with other components, and how it addresses each REQ-* in its Satisfies list. If ASR-flagged, explicitly state the architectural decision made in response to its structural constraint.]

*[Add a subsection for each COMP-NNN from §4.]*

### 8.3 Integration Architecture

[REPLACE WITH how components interact with each other and with external systems. Describe integration patterns and data contracts for critical integration points.]

### 8.4 Data Architecture

[REPLACE WITH data models for key entities, storage technology choices, data flow, data residency decisions, and data lifecycle.]

### 8.5 Security Architecture

[REPLACE WITH authentication and authorisation model, data protection, trust boundaries, and how REQ-S-* requirements are addressed.]

### 8.6 Operational Architecture

[REPLACE WITH deployment model, observability strategy, failure modes, and how NFR requirements for availability and performance are met.]

---

## 9. Architecture Decisions (ADR Index)

*Index of all ADRs for this initiative. Every significant technology choice, pattern selection, and trade-off must have an ADR. ADRs live in `workspace/artifacts/design/adrs/`.*

*Every ADR must be ratified (accepted or superseded) before human gate sign-off.*

| ADR ID  | Title                            | Status    | Key Decision                                        |
|---------|----------------------------------|-----------|-----------------------------------------------------|
| ADR-001 | [REPLACE WITH ADR title]         | proposed  | [REPLACE WITH one-sentence summary of the decision] |

*Add a row for every ADR generated for this initiative.*

---

## 10. Risk Register

*Architecture risks with likelihood, impact, mitigation, and owner. Every entry must have all four fields.*

| Risk ID  | Description                                   | Likelihood            | Impact                | Mitigation                                | Owner               |
|----------|-----------------------------------------------|-----------------------|-----------------------|-------------------------------------------|---------------------|
| RISK-001 | [REPLACE WITH clear description of the risk]  | high \| medium \| low | high \| medium \| low | [REPLACE WITH concrete mitigation action] | [REPLACE WITH name] |

---

## 11. Open Issues and Assumptions

*Every entry must have an owner or an explicit resolved-by statement.*

| Item ID | Description                                            | Type                  | Owner               | Target Resolution                          |
|---------|--------------------------------------------------------|-----------------------|---------------------|--------------------------------------------|
| OI-001  | [REPLACE WITH description of open issue or assumption] | Issue \| Assumption   | [REPLACE WITH name] | [REPLACE WITH date/milestone or TBD by...] |

---

## 12. Stakeholder Approval Record

*Explicit sign-off from named stakeholders. Populated during /jupiter:review.*

| Name                     | Role                  | Decision                           | Date       | Notes                         |
|--------------------------|-----------------------|------------------------------------|------------|-------------------------------|
| [REPLACE WITH full name] | Lead Architect        | Approved \| Rejected \| Abstained  | YYYY-MM-DD | [REPLACE WITH notes or "None"] |
| [REPLACE WITH full name] | Business Owner        | Approved \| Rejected \| Abstained  | YYYY-MM-DD | [REPLACE WITH notes or "None"] |
| [REPLACE WITH full name] | [REPLACE WITH role]   | Approved \| Rejected \| Abstained  | YYYY-MM-DD | [REPLACE WITH notes or "None"] |

*Add a row for each stakeholder named in workspace/context/project.yml.*

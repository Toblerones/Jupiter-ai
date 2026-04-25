# Requirements: {Initiative Title}

<!-- Metadata -->

| Field          | Value                                                 |
|----------------|-------------------------------------------------------|
| Initiative     | {initiative-id}                                       |
| Version        | 0.1.0-draft                                           |
| Date           | {YYYY-MM-DD}                                          |
| Status         | draft \| approved                                     |
| Business Owner | [REPLACE WITH name]                                   |
| Lead Architect | [REPLACE WITH name]                                   |

---

## 1. Overview

*System purpose, scope boundaries, and relationship to the initiating intent.*

### 1.1 Problem Statement

[REPLACE WITH a clear statement of the problem being solved. Written in business terms — what is broken, missing, or needed and why it matters. No architecture or technology language.]

### 1.2 Scope

**In scope:**
- [REPLACE WITH specific capabilities, user types, data domains, or systems in scope]

**Out of scope:**
- [REPLACE WITH what is explicitly not addressed — undeclared scope becomes implicit scope]

### 1.3 Stakeholders

| Name                     | Role            | Responsibility                    |
|--------------------------|-----------------|-----------------------------------|
| [REPLACE WITH full name] | Business Owner  | Confirms requirements are correct |
| [REPLACE WITH full name] | Lead Architect  | Confirms completeness for design  |

---

## 2. Terminology

*Every domain-specific term used in the requirements, defined precisely.*

| Term       | Definition                                                     |
|------------|----------------------------------------------------------------|
| {Term}     | [REPLACE WITH precise definition in business/domain language]  |

---

## 3. Functional Requirements

*What the system must do for users or the business. Tech-agnostic — no architecture decisions here.*

### REQ-F-{DOMAIN}-001: {Requirement Title}

**Priority**: Critical | High | Medium
**Traces To**: {intent reference}

**Description**: [REPLACE WITH what the system must do for users or the business. Express as a capability or outcome. "The system must allow {user} to {do something}" is a good pattern.]

**Acceptance Criteria**:
- [REPLACE WITH testable criterion — measurable, specific, falsifiable]

---

*[Add a REQ-F-{DOMAIN}-NNN section for each functional requirement.]*

---

## 4. Non-Functional Requirements

*Quality attributes the system must meet.*

### REQ-NFR-{DOMAIN}-001: {Requirement Title}

**Priority**: Critical | High | Medium
**Traces To**: {intent reference}

**Description**: [REPLACE WITH the quality attribute requirement — performance, availability, scalability, maintainability, reliability.]

**Acceptance Criteria**:
- [REPLACE WITH measurable threshold — e.g. "p99 latency < 2s under 10,000 req/hour load"]

---

*[Add REQ-NFR sections as needed.]*

---

## 5. Business Rules

*Domain constraints, policies, and business logic the system must enforce regardless of implementation.*

### REQ-BR-{DOMAIN}-001: {Rule Title}

**Priority**: Critical | High | Medium
**Traces To**: {intent reference}

**Description**: [REPLACE WITH the business rule — a domain constraint or policy. "An invoice cannot be approved by the same person who submitted it" is a good example.]

**Acceptance Criteria**:
- [REPLACE WITH how compliance with this rule is verified]

---

*[Add REQ-BR sections as needed.]*

---

## 6. Compliance and Regulatory Requirements

*Legal, regulatory, or standards obligations. Required if project.yml declares a compliance constraint.*

### REQ-C-{DOMAIN}-001: {Compliance Requirement Title}

**Priority**: Critical | High | Medium
**Traces To**: {intent reference}

**Description**: [REPLACE WITH the compliance obligation — regulation, standard, or contractual requirement.]

**Acceptance Criteria**:
- [REPLACE WITH how compliance is verified or demonstrated]

---

*[Add REQ-C sections as needed. If no compliance requirements apply, state: "No compliance or regulatory requirements apply to this initiative."]*

---

## 7. Security Requirements

*Authentication, authorisation, data protection, and threat model requirements.*

### REQ-S-{DOMAIN}-001: {Security Requirement Title}

**Priority**: Critical | High | Medium
**Traces To**: {intent reference}

**Description**: [REPLACE WITH the security requirement — authentication model, authorisation rule, data protection need, or threat to mitigate.]

**Acceptance Criteria**:
- [REPLACE WITH verifiable security criterion]

---

*[Add REQ-S sections as needed.]*

---

## 8. Success Criteria

*How do we know the system works? Measurable outcomes tied to REQ keys.*

| Criterion | Measurement                          | REQ Key         |
|-----------|--------------------------------------|-----------------|
| {Name}    | [REPLACE WITH measurable outcome]    | REQ-F-{DOM}-NNN |

---

## 9. Assumptions and Dependencies

### Assumptions

- [REPLACE WITH what the requirements assume about the environment, users, or existing systems.]

### Dependencies

- [REPLACE WITH external systems, decisions, or capabilities this initiative depends on.]

---

## 10. Human Gate Sign-off

*Populated during /jupiter:review. Both sign-offs required before the requirements phase is complete.*

| Role            | Name                     | Confirmation                                                                  | Date       |
|-----------------|--------------------------|-------------------------------------------------------------------------------|------------|
| Business Owner  | [REPLACE WITH full name] | Confirmed: requirements accurately reflect the intended problem and goals      | YYYY-MM-DD |
| Lead Architect  | [REPLACE WITH full name] | Confirmed: requirements are complete and correctly expressed in business terms | YYYY-MM-DD |

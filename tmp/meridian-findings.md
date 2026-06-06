# Architecture Peer Review — Meridian Invoice Processing SOAP v1.2

Reviewer: M. Tan (Enterprise Architect)
Submitted by: Payments Delivery Team
Date: 2026-05-30
Purpose: Pre-Review peer review

VERDICT: CONDITIONAL — NOT YET REVIEW-READY

The submission and PO validation design is sound and the service decomposition is appropriate for the scope. Two issues must be resolved before this can be tabled for review: a compliance violation in the storage design (legal obligation, not negotiable) and missing NFR design for the system's stated performance target. Once these are addressed and two ADRs are drafted, this should be ready to submit.

Findings: 1 blocker • 3 major • 1 minor • 1 observation
Open questions: 2

## Are we doing the right thing?

The problem is correctly framed. Digitising invoice approval addresses a genuine operational and compliance risk — the current spreadsheet process has no audit trail and creates ATO exposure. The business case is credible and the scope (submission → validation → approval → archival) is appropriately bounded for a first release. There is no obvious overreach into adjacent finance processes that would have inflated complexity.

The requirements baseline supports the design with one notable exception:

[MAJOR] **No business basis recorded for the 30-second NFR target.** REQ-NFR-PROC-001 states 30 seconds as a hard SLA at 500 concurrent users but no rationale is documented. The design will lock around this number — if it came from a stakeholder workshop it should be captured, and if 45 seconds would still deliver the value, the constraint should be relaxed before design proceeds. This is a requirements artifact issue more than a SOAP issue, but it materially affects the architecture commitment.

The security requirement (REQ-S-AUTH-001 — $10k threshold) is well-formed and the compliance requirement (REQ-C-COMP-001 — 7-year retention) is unambiguous. The functional requirements are clear and testable.

## Are we doing things right?

The architecture approach is sound at the level it operates: a clear separation of submission, PO validation, approval workflow, and storage, with the API gateway and PO validation patterns matching what the organisation has used successfully in adjacent services. The synchronous PO check is the right call for the consistency requirement. The complexity is proportional to the problem — there is no over-engineering.

Two design issues need resolution before review:

[BLOCKER] **Storage design does not meet the compliance obligation.** §3.4 specifies a standard PostgreSQL table for invoice records. The 7-year tamper-evident retention obligation (REQ-C-COMP-001, ATO Recordkeeping) cannot be satisfied with a mutable relational table. The SOAP needs a write-once archival tier (e.g. S3 Object Lock, Azure Immutable Blob) for completed invoices, plus a documented retention lifecycle. This is a legal obligation, not a design preference. An ADR is required documenting the archival storage decision.

[MAJOR] **No NFR design.** Nothing in §3 or §5 addresses the 30-second SLA. There is no caching strategy, no async/queue design for the approval workflow, no horizontal scaling consideration, and no sizing for the deployment. The team has committed to a performance target the design does not back. Add an NFR section covering load profile and architectural response.

[MAJOR] **Email-based approval workflow deviates from standards without an ADR.** §3.4 uses email for approval notifications. Architecture standard STD-003 requires event-driven async for multi-step approvals. The deviation may be defensible (low volume, existing email infrastructure) but it must be recorded as an ADR — the review board will require this.

[MINOR] **Server-side enforcement of the $10k threshold not designed.** §3.5 references RBAC but does not specify where the $10k threshold check runs. If enforced only in the UI, this is a control bypass risk. Clarify that the Approval Workflow Service performs server-side enforcement with an audit log entry per decision.

[OBSERVATION] **PII handling for supplier data is well-handled** — §4.2 applies data classification, addresses residency, and includes a deletion workflow. This is a notable strength.

## Standards Conformance

| Decision / Component (SOAP ref) | Standard | Status | Notes |
|---|---|---|---|
| API layer (§3.2) | STD-001 API gateway pattern | Conformant | |
| PO validation (§3.3) | STD-005 synchronous service call | Conformant | |
| Approval notification (§3.4) | STD-003 event-driven async approvals | Deviation (no ADR) | ADR required — see MAJOR finding in §2 |
| Data classification (§4.2) | STD-007 PII handling | Conformant | Supplier data classified, residency addressed |
| Approval audit (§3.5) | STD-011 audit trail for financial ops | Gap | No audit log designed for threshold decisions |
| Storage tier (§3.4) | STD-009 data lifecycle / retention | Deviation (no ADR) | Linked to BLOCKER in §2; ADR required |

## Regulatory & Policy Compliance

| Obligation | Source | Assessment | Confidence |
|---|---|---|---|
| 7-year tamper-evident retention | ATO Recordkeeping / data-retention-policy.md | Not met — PostgreSQL standard table; no immutability or archival tier present | High |
| PII handling for supplier data | GDPR Art. 5, 17 / gdpr-policy.md | Met — classification, residency, deletion workflow present | Medium |
| Audit trail for approvals above threshold | Internal financial controls policy | Partial — RBAC referenced; server-side enforcement and audit log absent | High |
| Data residency (supplier data) | Privacy Act 1988 | Not assessable — hosting region not specified in SOAP | Low |

**Specialist input needed (Low-confidence rows):**

- *Privacy Act residency*: confirm hosting region in §5 (Deployment) and have privacy counsel review. The 1988 Privacy Act treatment of supplier PII held offshore has nuance the reviewer is not equipped to call definitively.

## ADR Coverage

| Decision | ADR Status |
|---|---|
| Synchronous PO validation | ADR-014 (Accepted) |
| API gateway selection | ADR-008 (Accepted) |
| Email-based approval notification | **Missing — required** |
| Archival storage tier | **Missing — required** |
| Database technology selection (PostgreSQL) | Implicit — recommend ADR if non-default for this domain |

Two significant decisions in §3.4 are not documented as ADRs. The review board will ask. Draft these before submission.

## Open Questions

1. **What is the business basis for the 30-second SLA target?** Required to validate REQ-NFR-PROC-001 — confirm with Finance Owner.

2. **What is the intended hosting region?** Required to complete the Privacy Act residency assessment — confirm with delivery lead, and have privacy counsel review.

## Pre-Review Readiness Checklist

Once the SOAP author has worked through this list, the package should be review-ready.

- [ ] [BLOCKER] Storage redesigned with write-once archival tier; retention lifecycle documented
- [ ] [BLOCKER] ADR drafted for archival storage decision (status: Proposed)
- [ ] [MAJOR] NFR section added to SOAP — load profile + architectural response for 30s SLA
- [ ] [MAJOR] 30s SLA business rationale documented in requirements artifact
- [ ] [MAJOR] ADR drafted for email approval pattern deviation (status: Proposed)
- [ ] [MAJOR] Server-side audit log designed for approval workflow (STD-011 gap)
- [ ] [MINOR] §3.5 updated to specify server-side $10k threshold enforcement
- [ ] Open Q1 answered — SLA rationale confirmed with Finance Owner
- [ ] Open Q2 answered — hosting region added to §5; privacy counsel consulted

## Sign-off

| Reviewed by | Date | Decision | Notes |
|---|---|---|---|
| | | | |

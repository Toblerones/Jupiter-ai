# Requirements: Tax Provision Automation
**Initiative**: tax-provision-automation-001
**Business Owner**: Michael Torres, Group Financial Controller
**Lead Architect**: Alex Nguyen
**Phase**: Requirements — Iteration 1
**Date**: 2026-05-10
**Status**: Ready for Review

---

## 1. Source Analysis

### 1.1 Ambiguities

**A-001 — "All Macquarie entities"**
The intent states that the provision calculation must cover "all Macquarie entities." Macquarie Group comprises hundreds of legal entities globally.
- **Interpretation chosen**: In-scope entities are those loaded into the Group's designated tax provision platform as active participants in the current financial year. In practice this means the Macquarie Tax Consolidation Group (head entity: Macquarie Group Limited) plus material foreign subsidiaries designated for inclusion by the Group Head of Tax.
- **Why**: The tax provision platform (Oracle TRCS) is already loaded with the in-scope entity set. This avoids an arbitrary cut and aligns with the current operational boundary.
- **Architect action required**: Confirm which entity perimeter applies — specifically, whether foreign branches and associates outside the Tax Consolidation Group are in scope.

**A-002 — "Within the monthly close window"**
The intent references completing provision within the close window but does not define that window numerically.
- **Interpretation chosen**: The close window is T+3 business days after financial period end. This is derived from the integration landscape constraint on the general ledger (ORACLE_FUSION_GL: "Period close lock enforced at T+3 business days").
- **Why**: T+3 is the authoritative close deadline documented in the landscape.
- **No architect action required** — assumption is well-grounded in loaded context.

**A-003 — "Natural by-product" for CbCR**
The intent describes country-by-country reporting data as a "natural by-product of the monthly provision process" but does not clarify whether the initiative covers (a) producing the data extract, (b) validating it against ATO schema, or (c) lodging it with the ATO.
- **Interpretation chosen**: This initiative covers production of the CbCR data extract and ATO schema validation. Actual ATO e-lodgement is treated as out of scope — it is currently an annual (not monthly) obligation and requires a separate regulatory submission workflow. Data produced by this initiative feeds that annual lodgement process.
- **Architect action required**: Confirm that ATO lodgement workflow remains out of scope.

### 1.2 Gaps

**G-001 — Tax provision user roles not defined in intent**
The intent references "Group Tax team" without defining the roles involved in the provision process (preparers, reviewers, approvers). Without role definitions, access control and segregation of duties requirements cannot be derived.
- **Disposition**: Assumed-here. Three roles are defined in this artifact based on standard tax provision governance practice: Preparer, Reviewer, Approver. Architect/business owner to confirm.

**G-002 — Compliance obligations broader than CPS 230**
The intent's Known Constraints list APRA CPS 230 (the only obligation declared in project.yml) but the regulatory policy context (regulatory-compliance-policy.md) identifies AASB 112/IAS 12, SOX Section 404, ATO record-keeping, and CbCR obligations as directly applicable. These are not stated in project.yml but are clearly applicable.
- **Disposition**: Assumed-here. All four additional compliance obligations are included as C-type requirements in this artifact. Architect and business owner to confirm scope.

**G-003 — Performance targets not stated in intent**
No latency, throughput, or availability targets are stated in the intent. These are required to make NFR requirements measurable.
- **Disposition**: Assumed-here. Targets are derived from the close window constraint (T+3 → 4-hour calculation window), operational landscape, and standard finance system expectations. See REQ-NFR-* below.

**G-004 — Historical data migration not addressed**
The intent does not address whether historical provision workpapers from prior periods need to be migrated into the new system.
- **Disposition**: Defer-to-design. Migration scope is a delivery decision. This artifact defines forward-going requirements only. Migration will be addressed as a separate workstream at design phase.

**G-005 — Intra-period refresh frequency not stated**
The intent's Desired Outcome 2 says leadership can view ETR "at any point during the month" but gives no refresh frequency.
- **Disposition**: Assumed-here. Reporting data is refreshed at least once per business day, aligned with CDH batch pipeline schedule (morning load before 06:00 AEST). Near-real-time intra-day refresh is not required.

### 1.3 Speculative Content

None identified. The intent is actionable throughout; no exploratory or feasibility-seeking language was found.

---

## 2. Stakeholder Map

| Role | Name | Responsibility |
|------|------|---------------|
| Business Owner | Michael Torres, Group Financial Controller | Confirms requirements reflect intended problem; period close accountability |
| Lead Architect | Alex Nguyen | Confirms requirements completeness; approves SAD and ADRs |
| Primary Business User | Sarah Chen, Group Head of Tax | Tax provision process owner; primary user community lead |
| System Users | Group Tax team (Preparers, Reviewers, Approvers) | Day-to-day system users |
| Secondary Consumers | Finance leadership, Board reporting team | ETR reporting consumers |
| Compliance | External auditors | Annual ITGC review; SOX 404 testing |
| Regulatory | APRA | CPS 230 oversight |
| Regulatory | ATO | CbCR data recipient; record-keeping regulator |
| Technical Owner | Finance Architecture | Integration design; system ownership |
| Technical Contributor | Group Technology — Data Engineering | Enterprise data platform integration |

---

## 3. Scope Boundary

### 3.1 In Scope

1. Tax provision calculation — current tax and deferred tax movements — for all in-scope entities (Macquarie Tax Consolidation Group + designated material foreign subsidiaries)
2. Deferred tax asset and liability computation, including identification of temporary differences and application of statutory tax rates
3. Effective tax rate (ETR) calculation and intra-month reporting for in-scope entities
4. Deferred tax reconciliation: movement analysis comparing DTA/DTL balances to prior period
5. Period close workflow: data retrieval, calculation, review, and approval gates enforced by the system
6. Calculation audit trail and workpaper storage covering every provision figure, with full traceability to source financial data
7. Tax rate reference management: single authoritative rate table maintained by Group Tax
8. Country-by-country data extract for in-scope jurisdictions, validated against ATO schema
9. Access control for Group Tax team: role-based (Preparer, Reviewer, Approver)
10. Integration with: (a) Group general ledger as source of pre-tax financials; (b) Group consolidation system as source of consolidated pre-tax profit; (c) enterprise data platform as the destination for ETR and reporting datasets

### 3.2 Out of Scope

1. **Australian income tax return preparation and ATO e-lodgement** — owned by Alphatax; no change to that workflow
2. **ATO e-lodgement of the annual CbCR** — this initiative produces the data extract; the lodgement workflow is a separate annual process
3. **Transfer pricing documentation and benchmarking** — separate Group Tax function; not part of tax provision
4. **GST/BAS preparation and lodgement** — separate obligation; different system and process
5. **Payroll tax computation** — owned by People & Culture; feeds GL via separate interface
6. **FATCA/CRS client account reporting** — separate regulatory obligation
7. **Tax strategy, tax advice, and opinion management** — policy function, not system
8. **Migration of historical provision workpapers** — prior-period data migration is a delivery decision deferred to design and project planning
9. **Modification of Tax Consolidation Group membership** — Group Tax policy decision, not a system function
10. **iOS and Android native mobile applications** — reporting access is via web browser only

---

## 4. Problem Statement

The monthly tax provision process at Macquarie Group is managed through a fragmented set of manual workpapers maintained by the Group Tax team. Financial data is collected from the general ledger and circulated between team members by email, resulting in version control failures, reconciliation errors, and risk of missing period close deadlines. Tax provision calculations — covering current tax, deferred tax movements, and the effective tax rate — cannot be completed consistently or within the required close window as the Group's entity count and jurisdictional complexity grow.

*(Reproduced from approved workspace/INTENT.md — no changes.)*

---

## 5. Functional Requirements

---

### Provision Calculation

**REQ-F-PROV-001** — Entity provision completion
The system must enable Group Tax to initiate and complete the full tax provision calculation — including current tax, deferred tax movements, and effective tax rate — for all in-scope entities within each monthly close window.

Acceptance criteria:
- All in-scope entities have a completed and approved provision calculation, with zero outstanding validation errors, by T+3 business days after period end.
- The system records the completion timestamp and approver identity for each entity's provision.

traces_to: [Desired Outcome 1, Problem Statement — "cannot be completed consistently within the required close window"]

---

**REQ-F-PROV-002** — Automated financial data retrieval
The system must automatically retrieve the current period's pre-tax accounting profit, tax adjustments, and deferred tax temporary differences from the Group's authoritative financial ledger and consolidation system at the commencement of each provision run, without requiring manual data extraction or file transfer by Group Tax staff.

Acceptance criteria:
- Data retrieval for all in-scope entities completes without manual intervention.
- Retrieved financial values reconcile to the current period trial balance within ±0.01% of total for each entity.
- Any data retrieval failure is surfaced to the Group Tax administrator within 30 minutes of the failure.

traces_to: [Desired Outcome 1, Problem Statement — "Data is extracted from the general ledger and emailed between team members"]

---

**REQ-F-PROV-003** — Deferred tax asset and liability calculation
The system must calculate the deferred tax asset (DTA) and deferred tax liability (DTL) for each in-scope entity by applying the applicable statutory tax rate to identified temporary differences in the current period's trial balance, producing a balance sheet DTA/DTL position and a current period movement amount.

Acceptance criteria:
- DTA and DTL are computed for 100% of in-scope entities in each provision run.
- The sum of opening balance plus current period movement reconciles to the closing balance for each entity within ±$1.

traces_to: [Problem Statement — "deferred tax movements", Desired Outcome 3]

---

**REQ-F-PROV-004** — Consistent tax rate application
The system must apply tax rates from a single approved reference maintained by the Group Tax team. No provision calculation may use a rate that is not recorded in the approved reference. Any change to the reference rate for a jurisdiction must be recorded with the approver's identity and effective date before it can be used in a calculation.

Acceptance criteria:
- All tax rates used in provision calculations are traceable to the approved rate reference.
- Attempts to run a calculation using a rate not in the approved reference are rejected with a validation error.
- The rate audit log records: prior rate, new rate, effective date, approving user, approval timestamp.

traces_to: [Desired Outcome 3 — "consistent, independently auditable method"]

---

**REQ-F-PROV-005** — Provision version history
The system must maintain a complete version history for each entity's provision workpaper, retaining all prior period versions identifiable by period, calculation date, preparer, and workflow status.

Acceptance criteria:
- Any prior period's completed provision workpaper for any in-scope entity is retrievable from within the system without accessing external email archives or file stores.
- Version history is preserved for the full retention period (10 years minimum).

traces_to: [Problem Statement — "version control failures"]

---

**REQ-F-PROV-006** — Automated reconciliation report
The system must generate an automated reconciliation report for each entity upon completion of each period's provision calculation, comparing the calculated current-tax and deferred-tax amounts to the prior period closing balances and identifying all movements that exceed a defined threshold and require a preparer explanation.

Acceptance criteria:
- A reconciliation report is produced automatically for every in-scope entity on completion of the provision calculation, without manual compilation.
- Movements exceeding the configured threshold (default: ±5% of prior period balance) are flagged and require a preparer explanation before the provision can progress to review.

traces_to: [Problem Statement — "reconciliation errors"]

---

### Close Workflow

**REQ-F-CLOSE-001** — Structured close workflow with approval gates
The system must enforce a sequential close workflow for each entity's monthly provision: (1) data retrieval, (2) calculation, (3) preparer sign-off, (4) reviewer sign-off, (5) approver sign-off. No step may be completed out of sequence, and no provision figure may be released for consolidated reporting until all five steps are complete for that entity.

Acceptance criteria:
- Provision figures for an entity are inaccessible in consolidated reporting views until that entity's provision reaches status "Approved".
- Attempts to progress a workflow step out of sequence are rejected by the system.
- Workflow status and completion timestamp for each step are recorded and queryable.

traces_to: [Desired Outcome 1, Problem Statement — "email-based coordination", Known Constraint — SOX 404]

---

### Reporting

**REQ-F-RPT-001** — Intra-month ETR reporting access
The system must provide designated finance and tax leadership with a view of the current-period effective tax rate and deferred tax balances for any in-scope entity, accessible on demand at any time during the month, reflecting the most recently approved calculation for each entity.

Acceptance criteria:
- ETR and deferred tax balance data for all in-scope entities is accessible without a manual data request, export, or intervention.
- Data displayed reflects the most recently approved calculation for each entity; the date and time of that calculation is shown alongside the figure.

traces_to: [Desired Outcome 2]

---

### Audit Trail

**REQ-F-AUDIT-001** — Complete, immutable calculation audit trail
The system must record a complete calculation audit trail for every tax provision figure, capturing: the source financial data values used, the calculation steps and formulas applied, the tax rates and parameters used, and the identity and timestamp of every user who reviewed or approved that figure.

Acceptance criteria:
- Any tax provision figure in any reporting output can be traced from its final value back to the source financial data values within the system, without referencing external workpapers.
- Audit trail records cannot be modified or deleted after creation.
- The full audit trail for a given entity and period is producible within 30 minutes of an auditor request.

traces_to: [Desired Outcome 4, Known Constraint — SOX 404, Known Constraint — AASB 112]

---

### Country-by-Country Reporting

**REQ-F-CBCR-001** — CbCR data extract
The system must produce an annual country-by-country data extract at the end of each financial year's provision cycle, containing jurisdiction-level revenue, profit before tax, income tax accrued, income tax paid, and employee headcount for all in-scope Macquarie jurisdictions, in the format required for ATO lodgement under OECD BEPS Action 13.

Acceptance criteria:
- CbCR data extract is produced without manual aggregation or spreadsheet compilation steps.
- The extract passes ATO CbCR XML schema validation without errors.
- All jurisdictions for which Macquarie entities are in scope are represented in the extract.

traces_to: [Desired Outcome 5, Known Constraint — ATO obligations (CbCR)]

---

### Access and Roles

**REQ-F-ACCESS-001** — Role-based access for Group Tax
The system must support three distinct access roles for Group Tax users: Preparer (may enter data and trigger calculations), Reviewer (may view and add review comments), and Approver (may issue final approval for an entity's provision). Each role must be independently assignable per entity for users whose responsibilities span multiple entities.

Acceptance criteria:
- A user with the Preparer role for an entity cannot perform the approval action for that entity's provision.
- A user with the Reviewer role cannot trigger a calculation or submit for approval.
- The Approver role is restricted to users explicitly assigned by the Group Tax data owner.
- Role assignments are entity-specific: a user may hold different roles for different entities.

traces_to: [Problem Statement — "no access control in email-based process", Known Constraint — SOX 404, Known Constraint — identity and access control]

---

## 6. Non-Functional Requirements

---

**REQ-NFR-PROV-001** — Provision calculation throughput
The full tax provision calculation for all in-scope entities must complete within 4 hours of initiation under normal operating conditions.

Acceptance criteria:
- End-to-end provision calculation (data retrieval through calculated output available for review) completes in ≤ 4 hours for a run covering up to 150 entities.
- This target is verified by load testing under simulated full-entity workload before go-live.

traces_to: [Desired Outcome 1 — "within the monthly close window", Business Context — "T+3 close lock"]

---

**REQ-NFR-RPT-001** — Reporting availability
The ETR and deferred tax balance reporting capability must be available to authorised users at least 99.5% of measured time during business hours (07:00–20:00 AEST, Monday–Friday), excluding approved maintenance windows notified at least 48 hours in advance.

Acceptance criteria:
- Monthly measured availability of the reporting capability meets or exceeds 99.5% during the defined business hours window.
- Approved maintenance windows are communicated to Group Tax at least 48 hours in advance and excluded from availability calculations.

traces_to: [Desired Outcome 2 — "at any point during the month"]

---

**REQ-NFR-DATA-001** — Provision record retention
All tax provision calculations, source data snapshots, workpaper versions, and audit trail records must be retained and retrievable for a minimum of 10 years from the period end date of the relevant calculation.

Acceptance criteria:
- Records from the 10 full financial years preceding the current year are accessible via the system's query interface without offline restoration or manual archive retrieval.
- Retention is verified by annual data governance audit.

traces_to: [Known Constraint — ATO obligations (10-year retention)]

---

**REQ-NFR-AUDIT-001** — Audit trail immutability
The calculation audit trail must be immutable: no audit record may be modified or deleted after its creation.

Acceptance criteria:
- All attempts to modify or delete an existing audit record via any system interface are rejected and the attempt is itself logged.
- Audit record integrity is verifiable via checksums or equivalent; integrity verification is performed and results are retained for each annual ITGC review cycle.

traces_to: [Desired Outcome 4, Known Constraint — SOX 404]

---

## 7. Business Rules

---

**REQ-BR-PROV-001** — Segregation of duties: preparer and approver
A tax provision for an entity must not be approved by the same individual who prepared it.

Acceptance criteria:
- The system enforces that the Approver identity on a provision record differs from the Preparer identity for the same entity and period.
- Approval attempted by the Preparer of the same provision is rejected with a specific error.

traces_to: [Known Constraint — SOX 404 (segregation of duties)]

---

**REQ-BR-PROV-002** — Approved tax rate mandatory
A provision calculation may only be executed using tax rates that are recorded in the Group Tax team's approved rate reference at the time of calculation. No calculation may proceed using a rate that has not been formally approved in the reference.

Acceptance criteria:
- Calculations referencing a jurisdiction whose rate is absent from, or expired in, the approved reference are halted with a validation error identifying the missing jurisdiction.
- The system does not allow the use of a rate that has been superseded without explicit reapplication.

traces_to: [Desired Outcome 3 — "consistent, independently auditable method"]

---

**REQ-BR-PROV-003** — Locked period immutability
A provision record for an entity and period must not be modified after the period close lock has been applied. Any correction to a locked period must be recorded as a separate adjustment entry that references the original record, is subjected to the same approval workflow, and is distinguishable from the original in all reporting outputs.

Acceptance criteria:
- Modification of any field in a provision record for a locked period is rejected by the system.
- Corrections appear as separate, linked adjustment entries visible in reporting alongside the original.
- The original record is preserved unchanged.

traces_to: [Problem Statement — "version control failures", Known Constraint — AASB 112 (auditable method)]

---

**REQ-BR-CLOSE-001** — Consolidated view excludes unapproved provisions
A provision figure for an entity may not appear in any consolidated Group tax position, ETR calculation, or reporting output until that entity's provision for the relevant period has completed all mandatory workflow approval steps.

Acceptance criteria:
- The consolidated Group ETR and deferred tax position views include only entities with provision status "Approved" for the relevant period.
- Entities whose provisions are in progress, pending review, or pending approval are excluded and identified as "Pending" in the consolidated view.

traces_to: [Desired Outcome 1, Known Constraint — SOX 404]

---

## 8. Compliance Requirements

---

**REQ-C-COMP-001** — APRA CPS 230: operational risk management
The tax provision system must be operated in compliance with APRA CPS 230 Operational Risk Management. All material service providers that host or operate components of the tax provision system must be subject to documented contracts that include: defined service levels, audit rights for Macquarie, and exit/transition clauses.

Acceptance criteria:
- At least one current service agreement for each material service provider supporting the tax provision system is held and accessible for APRA review.
- Each agreement includes audit rights, defined service level obligations, and exit/transition provisions.
- The system is listed in the operational risk register as a key process with documented risk tolerance.

traces_to: [Known Constraint — APRA CPS 230, Business Context — CPS 230 effective 1 July 2025]

---

**REQ-C-COMP-002** — APRA CPS 230: operational continuity
A documented operational continuity plan for the tax provision process must be maintained, tested at least annually, and demonstrate that the tax provision can be completed within the monthly close window even if the primary system is unavailable for up to 4 continuous hours.

Acceptance criteria:
- Operational continuity plan document exists, was reviewed and tested within the prior 12 months, and demonstrates a fallback process that maintains T+3 close capability.
- Annual test results are recorded and available for APRA review.

traces_to: [Known Constraint — APRA CPS 230, Business Context — person-dependent process cannot demonstrate CPS 230 resilience]

---

**REQ-C-COMP-003** — AASB 112 / IAS 12: tax effect accounting methodology
The deferred tax calculation methodology applied by the system must comply with AASB 112 / IAS 12 requirements for tax effect accounting. The methodology must be documented, consistently applied across all entities and periods, and independently auditable from the system's own records without reference to external workpapers.

Acceptance criteria:
- A methodology specification document is maintained and reviewed annually by Group Tax.
- The same methodology governs calculations across all in-scope entities; any entity-level exception is documented and approved.
- An external auditor can verify the calculation method applied in any period from the system's audit trail alone.

traces_to: [Known Constraint — AASB 112/IAS 12, Desired Outcome 4 — "independently verify the calculation logic"]

---

**REQ-C-COMP-004** — ATO country-by-country reporting (CbCR)
The system must produce data necessary for Macquarie's annual country-by-country report lodged with the ATO under OECD BEPS Action 13. The CbCR data extract must conform to the ATO's published XML schema and validation requirements for the relevant tax year.

Acceptance criteria:
- Annual CbCR data extract is produced by the system for the relevant financial year.
- The extract passes ATO CbCR XML schema validation with zero errors.
- All Macquarie jurisdictions designated in-scope for CbCR are represented.

traces_to: [Known Constraint — ATO obligations (CbCR), Desired Outcome 5]

---

**REQ-C-COMP-005** — SOX Section 404: IT general controls
All IT general controls over the tax provision system that are assessed under SOX Section 404 compliance — specifically access management, change management, and data integrity controls — must be designed and operated to withstand annual external audit assessment.

Acceptance criteria:
- Annual SOX ITGC assessment by external auditors produces no material weaknesses attributable to the tax provision system.
- Evidence of access reviews, change records, and data integrity checks is producible within 5 business days of an auditor request.
- User access logs, system change logs, and data integrity verification results are retained for a minimum of 3 years.

traces_to: [Known Constraint — SOX Section 404, Business Context — "audit exposure"]

---

## 9. Security Requirements

---

**REQ-S-ACCESS-001** — Centralised identity and MFA
All user access to the tax provision system must be authenticated via the Group's centralised identity provider using multi-factor authentication. No local user accounts may exist within the system.

Acceptance criteria:
- 100% of user sessions are authenticated via the Group identity provider.
- MFA is enforced for all users; access without MFA is technically prevented, not just policy-prohibited.
- No local credentials exist in any tax provision system component; confirmed by configuration audit at go-live and annually thereafter.

traces_to: [Known Constraint — identity and access control]

---

**REQ-S-ACCESS-002** — Least-privilege access and quarterly recertification
Access to tax provision data must be granted on a least-privilege basis. Each user must be granted access only to the entities for which they have a documented business need. All access must be recertified by the Group Tax data owner on a quarterly basis.

Acceptance criteria:
- Quarterly access recertification records exist for all users with access to tax provision data.
- Recertification is completed within 10 business days of the review period start.
- Users whose access is not recertified within 10 business days are automatically suspended.
- No user holds access to more entities than their active role assignment requires.

traces_to: [Known Constraint — identity and access (quarterly recertification), Known Constraint — SOX 404]

---

**REQ-S-DATA-001** — Data classification and encryption
All tax provision data must be classified as Confidential in the Group's data catalogue and must be encrypted at rest and in transit to the Group's minimum encryption standards.

Acceptance criteria:
- Tax provision datasets are tagged as Confidential in the enterprise data catalogue.
- All data at rest is encrypted using AES-256 or equivalent standard.
- All data in transit uses TLS 1.2 or higher; no unencrypted transmission paths exist between system components.

traces_to: [Known Constraint — identity and access, data governance policy — Confidential classification]

---

**REQ-S-DATA-002** — PII exclusion from logs and reports
Personally identifiable information must not be included in tax provision calculation records, audit trail entries, or reporting outputs, except where specifically required by a regulatory submission format.

Acceptance criteria:
- Tax provision calculation records, audit trail entries, and management reports contain no PII fields (names, contact details, personal tax file numbers) outside legally-mandated regulatory submission outputs.
- Annual data quality scan of provision records and audit logs returns no PII findings outside approved regulatory fields.

traces_to: [data governance policy — PII handling]

---

## 10. Open Issues

| ID | Issue | Owner | Status |
|----|-------|-------|--------|
| OI-001 | Entity perimeter — confirm which foreign entities are in scope for TRCS | Michael Torres / Sarah Chen | Open |
| OI-002 | CbCR lodgement — confirm that ATO e-lodgement workflow remains out of scope | Michael Torres | Open |
| OI-003 | Historical migration — confirm no prior-period workpaper migration is required for go-live | Alex Nguyen | Open |
| OI-004 | Reporting refresh frequency — confirm daily (morning) refresh is acceptable for intra-month ETR, or define if more frequent is required | Sarah Chen | Open |

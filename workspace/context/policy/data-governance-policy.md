# Data Governance Policy — Macquarie Group Finance Management
# Applies to: Finance, Tax, Treasury data assets
# Owner: Group Data Office — Finance Domain
# Effective: 2025-01-01 | Review cycle: Annual

---

## 1. Purpose

This policy governs how data is classified, managed, accessed, retained, and disposed of across Finance, Tax, and Treasury systems. All architecture designs within the Finance Management division must demonstrate compliance with this policy during the gate review process.

---

## 2. Data Classification

All Finance Management data assets must carry an approved classification label. Classification is assigned by the Data Steward at dataset creation and reviewed annually.

| Classification | Definition | Examples |
|---------------|-----------|---------|
| **Public** | Information approved for public release | Annual reports, media releases |
| **Internal** | Non-sensitive business information; not for external release without approval | Management commentary, budget summaries |
| **Confidential** | Sensitive business or client data; disclosure would cause material harm | Entity P&L, client account balances, tax workpapers |
| **Restricted** | Highly sensitive; disclosure would cause severe harm or regulatory breach | Individual trade data, SWIFT messages, MTM positions, APRA submissions |

### Classification Rules

- Every data asset (table, file, dataset, API response) must be labelled with one of the four classifications above.
- Classification is assigned at the **highest sensitivity level** of any field within the asset.
- Restricted data must never be stored in non-production environments without explicit approval from the Group Data Office and masking applied.
- Downgrading a classification requires Group Data Office approval.

---

## 3. Data Stewardship

Each Finance Management data domain has an assigned Data Steward and Data Owner.

| Domain | Data Owner | Data Steward |
|--------|-----------|-------------|
| General Ledger / Financials | Group Financial Controller | GL Operations Lead |
| Tax Data | Group Head of Tax | Tax Systems Manager |
| Treasury / Markets | Group Treasurer | Treasury Technology Lead |
| Regulatory Reporting | Chief Risk Officer | Regulatory Reporting Manager |
| Consolidation | Head of Group Reporting | Consolidation Manager |
| Planning & Forecasting | CFO | FP&A Manager |

**Data Owner responsibilities**: accountability for data quality and compliance; approves access requests beyond standard entitlements; approves classification changes.

**Data Steward responsibilities**: defines data quality rules and thresholds; manages golden source designations; resolves data quality incidents; approves new consumers of the data domain.

---

## 4. Golden Source Principle

- Every Finance Management data element has exactly one designated golden source (see `integration-landscape.yml` for system-level assignments).
- Downstream systems must consume from the golden source or from an approved derived copy.
- Derived copies must record their lineage back to the golden source.
- Creating a new copy of a golden source dataset requires Data Steward approval and registration in the CDH Glue Data Catalog.
- Discrepancies between a derived copy and the golden source must be treated as data quality incidents.

---

## 5. Data Quality Standards

All Finance Management data assets must meet the following quality dimensions:

| Dimension | Standard | Measurement |
|-----------|---------|-------------|
| **Completeness** | ≥ 99% for mandatory fields | % non-null mandatory fields per period |
| **Accuracy** | Reconciles to golden source within tolerance | Reconciliation variance < 0.01% of total |
| **Timeliness** | Data available within agreed SLA | % of data loads meeting SLA |
| **Consistency** | Same values across systems for shared keys | Cross-system match rate ≥ 99.9% |
| **Validity** | Conforms to defined domain rules | % records passing validation rules |

### Data Quality Incident Classification

- **P1 — Critical**: Data quality issue in a tier_1 system that affects regulatory submission, board reporting, or statutory accounts. Escalate immediately; RTO 4 hours.
- **P2 — High**: Issue in management reporting or planning data. Resolve within 1 business day.
- **P3 — Medium**: Issue in non-critical reporting. Resolve within 5 business days.
- **P4 — Low**: Documentation or metadata issues. Resolve within next sprint.

---

## 6. Data Lineage

- All data pipelines feeding regulatory reporting, statutory accounts, or board reporting must maintain full data lineage.
- Lineage is captured in AWS Glue Data Catalog + AWS Macie (connected to MGDP).
- Every pipeline must emit: source system, transformation applied, destination, timestamp, and operator/service identity.
- Lineage must be queryable to answer: "Where did this number come from?" for any value in a regulatory return or financial statement.

---

## 7. Data Access Control

### 7.1 Access Principles

- **Least privilege**: Users and services are granted only the minimum access required to perform their function.
- **Need-to-know**: Access to Confidential or Restricted data requires a documented business justification.
- **Role-based access**: Access is managed through Azure AD groups aligned to job function, not individual entitlements where possible.

### 7.2 Access Review

- All access to Confidential and Restricted Finance data must be recertified quarterly by the Data Owner.
- Stale access (unused for 90 days) is automatically revoked.
- Privileged access (write access to production financial data) requires PIM just-in-time activation with an approved change record.

### 7.3 Service Account Access

- Service accounts must be registered in the CDH service catalogue.
- Service accounts must use managed identities (Azure) or registered application credentials.
- Service account credentials rotate automatically every 90 days.
- Service accounts may not have interactive login capability.

---

## 8. Data Retention and Disposal

Retention schedules are defined by the Group Records Management Policy and supplemented by regulatory requirements:

| Data Category | Retention Period | Disposal Method |
|--------------|----------------|----------------|
| GL transactions and journals | 7 years | Secure deletion after legal hold review |
| Financial statements (statutory) | Permanent | Archive to cold storage |
| Tax records and workpapers | 10 years | Secure deletion after legal hold review |
| Treasury trades (deal records) | 7 years | Secure deletion |
| APRA regulatory returns | 7 years | Archive to cold storage |
| Audit logs | 3 years | Automated deletion |
| Budget and forecast data | 5 years | Standard deletion |
| Correspondence (finance-related) | 7 years | Secure deletion |

- **Legal hold**: Data subject to litigation or regulatory investigation must not be deleted regardless of retention schedule. Legal holds are applied by Group Legal.
- **Disposal certification**: Destruction of Confidential or Restricted data must be documented with a disposal certificate.

---

## 9. Privacy and PII Handling

- Finance Management systems may process PII in the context of employee expense claims, client account data (BFS), and tax reporting (PAYG, FATCA, CRS).
- PII handling must comply with the Privacy Act 1988 (APPs) for Australian individuals and GDPR for EU/EEA individuals.
- PII must not appear in:
  - Log files or diagnostic output
  - Error messages returned to API callers
  - Non-production environments (must be masked or synthesised)
  - Reports shared with parties who do not have a legitimate need
- Data subject access requests (SARs) must be fulfillable within 30 days.

---

## 10. Encryption Standards

| Scenario | Standard |
|---------|---------|
| Data at rest — Restricted | AES-256, customer-managed keys (Azure Key Vault) |
| Data at rest — Confidential | AES-256, platform-managed keys minimum |
| Data in transit | TLS 1.2 minimum; TLS 1.3 for new integrations |
| Backup encryption | AES-256; same classification as source data |
| Key rotation | Annual minimum for customer-managed keys |

---

## 11. Non-Production Environments

- Production Finance data must not be replicated to non-production environments unless:
  1. The data is masked to remove PII, client identifiers, and exact financial values.
  2. Approval from the relevant Data Owner has been obtained.
  3. The non-production environment has equivalent access controls to production.
- Synthetic data generation tools (approved list maintained by Group Data Office) are the preferred source for test data.
- Non-production environments must not have connectivity to production financial systems (SAP, Murex, SWIFT) without explicit firewall exception approved by Group Security.

---

## 12. Architecture Gate Requirement

All architecture designs in the Finance Management domain must document:

1. The data classification level of every data element the system produces or consumes.
2. The golden source for every data element consumed.
3. Data lineage from source system to consumer.
4. Retention schedule and disposal method for data the system persists.
5. PII handling approach (or explicit statement that no PII is processed).
6. Encryption approach for data at rest and in transit.

Failure to address any of the above will prevent the design human gate (HG-RD-002) from being approved.

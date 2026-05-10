# Regulatory Compliance Policy — Macquarie Group Finance Management
# Applies to: Finance, Tax, Treasury systems and processes
# Owner: Group Compliance & Regulatory Affairs
# Effective: 2025-01-01 | Review cycle: Annual

---

## 1. Purpose

This policy establishes the regulatory obligations that all Finance Management architecture initiatives must satisfy. Any system, process, or data flow within the Finance, Tax, or Treasury domains must be designed to comply with the obligations listed in this document.

Architects must assess each obligation for applicability at the requirements phase. Non-applicable obligations must be explicitly documented as out-of-scope with a justification.

---

## 2. Prudential Regulation (APRA)

Macquarie Bank Limited (MBL) and Macquarie Group Limited (MGL) are Authorised Deposit-taking Institutions (ADI) and/or Non-Operating Holding Companies (NOHC) regulated by APRA.

### 2.1 Capital Adequacy — APS 110 / Basel III/IV

- **Obligation**: MBL must maintain Common Equity Tier 1 (CET1), Tier 1, and Total Capital ratios above APRA minimums at all times.
- **Architecture implication**: Any system changes that affect risk-weighted asset (RWA) calculations, capital deductions, or capital instruments must be reviewed by Group Risk for capital impact.
- **Reporting**: Capital ratios are reported quarterly to APRA via APRA Connect (ARS 110 series).

### 2.2 Liquidity — APS 210

- **Obligation**: MBL must maintain LCR ≥ 100% and NSFR ≥ 100% at all times.
- **Architecture implication**: Systems that hold or generate HQLA data, cash flow projections, or intraday settlement data are in-scope for APS 210 compliance. Changes must be assessed for LCR/NSFR impact.
- **Reporting**: LCR reported monthly; NSFR reported quarterly. Intraday liquidity monitoring is daily.

### 2.3 Credit Risk — APS 112 / APS 113

- **Obligation**: Credit exposures must be measured and risk-weighted in accordance with APRA's standardised or internal ratings-based (IRB) approach.
- **Architecture implication**: Counterparty data, exposure calculations, and credit mitigation (collateral, netting) must flow accurately from source systems (Murex) to regulatory reporting.

### 2.4 Operational Risk — APS 115 / CPS 230

- **Obligation**: CPS 230 Operational Risk Management (effective 1 July 2025) requires boards to approve a risk tolerance statement, manage material service providers, and maintain operational continuity plans.
- **Architecture implication**: All Finance Management systems with criticality tier_1 must have documented business continuity plans (BCP) and disaster recovery (DR) targets: RTO ≤ 4 hours, RPO ≤ 1 hour.
- **Material service providers**: SAP, Oracle, Thomson Reuters, and SWIFT are classified as material service providers. Contracts must include audit rights and exit clauses.

### 2.5 Market Risk — APS 116

- **Obligation**: Market risk capital must be calculated and reported for trading book positions.
- **Architecture implication**: MTM valuations, VaR models, and sensitivities sourced from Murex must be auditable and reconcilable to capital calculations.

### 2.6 Data Reporting — ARS Regulatory Returns

- **Obligation**: Regulated entities must submit accurate and timely ARS returns to APRA via APRA Connect.
- **Architecture implication**: All systems feeding APRA reporting (MGDP → APRA Connect) must maintain data lineage. Submissions require dual sign-off.
- **Key return series**: ARS 110 (capital), ARS 210 (liquidity), ARS 112/113 (credit), ARS 310 (financial position), ARS 720 (asset quality).

---

## 3. Financial Markets Regulation (ASIC)

### 3.1 Financial Services — RG 000 Series

- **Obligation**: Macquarie entities holding Australian Financial Services Licences (AFSL) must maintain adequate systems and controls for financial advice, dealing, and market operations.
- **Architecture implication**: Any system supporting client-facing financial services must meet ASIC's technology risk expectations, including change management, access control, and operational resilience.

### 3.2 Market Integrity — ASIC Market Integrity Rules

- **Obligation**: Market participants must maintain records of all orders, transactions, and communications for a minimum of 7 years.
- **Architecture implication**: Trade and order data from Murex must be archived for 7 years with full audit trail. Data must be producible to ASIC within 5 business days of a request.

### 3.3 Short Selling Reporting

- **Obligation**: Gross short positions above threshold must be reported to ASIC daily.
- **Architecture implication**: Position data from Murex must feed short position aggregation and reporting with same-day cutoff.

---

## 4. Taxation Obligations

### 4.1 Australian Corporate Income Tax — ITAA 1936 / ITAA 1997

- **Obligation**: Macquarie Tax Consolidation Group (head entity: MGL) must lodge an annual income tax return with the ATO.
- **Architecture implication**: Systems producing taxable income data must maintain a clear audit trail from GL transactions to tax return line items. Alphatax is the system of record for Australian tax returns.

### 4.2 Goods and Services Tax — GST Act 1999

- **Obligation**: GST-registered entities must lodge Business Activity Statements (BAS) monthly. Financial services attract reduced input tax credits (RITC) at applicable rates (75% or 55%).
- **Architecture implication**: AP systems (SAP) must correctly classify purchases for RITC eligibility. GST coding must be reviewed when new entity structures or business activities are introduced.

### 4.3 Transfer Pricing — ITAA 1997 Part IVA / OECD Guidelines

- **Obligation**: All intercompany transactions must be priced on arm's length terms. Transfer pricing documentation must be maintained for all material intercompany transactions.
- **Architecture implication**: Intercompany transaction flows must be auditable end-to-end (SAP intercompany → ONESOURCE TP). New intercompany flows introduced by a design must be flagged to Group Tax for TP assessment.

### 4.4 FATCA / CRS Reporting

- **Obligation**: Macquarie financial institutions must identify reportable accounts and submit annual FATCA (US IRS) and CRS (relevant tax authorities) reports.
- **Architecture implication**: Any system holding client account data must support FATCA/CRS classification attributes. Data extraction for FATCA/CRS must produce compliant XML files.

### 4.5 Country-by-Country Reporting (CbCR)

- **Obligation**: MGL must lodge annual CbCR with the ATO. Master File and Local File documentation must be maintained for all material entities.
- **Architecture implication**: CbCR data (revenues, profits, taxes, employees by jurisdiction) must be producible from ONESOURCE and reconcilable to HFM consolidation data.

### 4.6 Payroll Tax / PAYG Withholding

- **Obligation**: Employer obligations for PAYG withholding from employee wages; annual PAYG Payment Summaries / STP2 reporting via ATO.
- **Architecture implication**: HR/payroll systems (out of scope for Finance Management architecture; owned by People & Culture) interface with SAP for GL postings. Any GL re-organisation affecting payroll cost centres must be tested with People & Culture.

---

## 5. International Regulatory Obligations

### 5.1 MiFID II (EU Markets in Financial Instruments Directive)

- **Obligation**: Macquarie entities providing investment services to EU clients must comply with MiFID II transaction reporting (EMIR/ESMA), best execution, and record-keeping requirements.
- **Architecture implication**: Trade data for EU-reportable instruments must be extractable in EMIR XML format and submitted to an Approved Reporting Mechanism (ARM) on T+1.

### 5.2 Dodd-Frank (US CFTC)

- **Obligation**: US-regulated swaps must be reported to a Swap Data Repository (SDR) on T+1.
- **Architecture implication**: Murex must produce CFTC-compliant swap data; SDR connectivity must support real-time reporting.

### 5.3 GDPR / Privacy

- **Obligation**: Personal data of EU/EEA individuals must comply with GDPR. Australian entities must comply with the Privacy Act 1988 (APPs).
- **Architecture implication**: Any Finance system processing personally identifiable information (PII) — names, account numbers, payment details — must implement data minimisation, purpose limitation, and subject access request (SAR) capabilities. PII must not appear in logs or diagnostic outputs.

### 5.4 SOX (Sarbanes-Oxley)

- **Obligation**: Macquarie entities with US-listed securities must comply with SOX Section 302 (CEO/CFO certifications) and Section 404 (internal control over financial reporting).
- **Architecture implication**: Financial systems in scope for SOX must have documented controls for access management, change management, and data integrity. IT General Controls (ITGCs) are tested annually by external auditors.

---

## 6. Record-Keeping Requirements

| Obligation | Minimum Retention | System of Record |
|------------|------------------|-----------------|
| GL transactions | 7 years | Oracle Fusion Cloud Financials |
| Tax returns and workpapers | 7 years (ATO) / 10 years (TP) | Alphatax, ONESOURCE |
| Treasury trade records | 7 years | Murex |
| ASIC market records | 7 years | Murex + MGDP archive |
| APRA regulatory submissions | 7 years | APRA Connect + MGDP |
| FATCA/CRS reports | 7 years | ONESOURCE |
| Audit logs (ITGCs) | 3 years | MGDP + SIEM |
| Payment instructions | 7 years | SWIFT + Oracle Fusion AP |

---

## 7. Breach Notification

| Regulator | Trigger | Deadline |
|-----------|---------|----------|
| APRA | Material breach of prudential standard | Within 10 business days |
| ASIC | Significant breach of licence obligation | Within 30 calendar days |
| ATO | Voluntary disclosure of tax error | Before ATO assessment |
| OAIC | Eligible data breach (Privacy Act) | Within 30 calendar days |

Any architecture design that creates or modifies a system that handles regulated data must include a breach detection and notification capability aligned with the above timelines.

---

## 8. Architecture Gate Requirement

The requirements phase gate (AI-RI-008) requires that all applicable regulatory obligations from this policy are listed in the requirements artifact as REQ-C (Compliance) requirements. The design phase gate (AI-RD-007) requires that each REQ-C requirement is addressed by an explicit design decision, control, or architecture component.

No design may be approved at the human gate (HG-RD-002) if any REQ-C requirement has no corresponding design element.

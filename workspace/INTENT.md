# Intent

## Problem Statement

The monthly tax provision process at Macquarie Group is managed through a fragmented set of manual workpapers maintained by the Group Tax team. Financial data is collected from the general ledger and circulated between team members by email, resulting in version control failures, reconciliation errors, and risk of missing period close deadlines. Tax provision calculations — covering current tax, deferred tax movements, and the effective tax rate — cannot be completed consistently or within the required close window as the Group's entity count and jurisdictional complexity grow.

## Business Context

Macquarie Group's tax provision is a direct input to the statutory financial statements, the Group's publicly disclosed effective tax rate, and country-by-country regulatory reports lodged annually with the ATO. Errors or delays in this process carry significant legal, financial, and reputational consequences.

Three converging pressures make the current approach untenable:

1. **Regulatory obligation (APRA CPS 230, effective 1 July 2025)**: APRA now requires documented operational continuity for key financial processes and evidence that material service providers are under appropriate contract and governance. The current person-dependent, email-driven workpaper process cannot demonstrate the resilience and control that CPS 230 demands.

2. **Audit exposure**: External auditors test the internal controls over financial reporting each year. The emailed workpaper approach lacks the access control, version history, and calculation audit trail that these reviews require — creating a material adverse finding risk in the next annual cycle.

3. **Scale and close timing**: Macquarie operates across multiple tax jurisdictions, each with distinct deferred tax treatment. The monthly close window locks at three business days after period end. The manual coordination required across entities and time zones is no longer compatible with that deadline at the Group's current scale.

## Desired Outcomes

- Group Tax can complete the full tax provision calculation — including current tax, deferred tax movements, and effective tax rate — for all Macquarie entities within the monthly close window, without relying on manual data collection or email-based coordination between team members.
- The Group Financial Controller and senior leadership can view current-period effective tax rate figures and deferred tax balances for any entity at any point during the month, not only at close, enabling proactive management of the Group's tax position before investor and regulatory deadlines.
- Deferred tax movements are calculated from the same authoritative source data each period using a consistent, independently auditable method, reducing the risk of misstatement in the Group's statutory accounts and public investor disclosures.
- External auditors and regulators can independently verify the origin, calculation logic, and approval chain for any tax provision figure, with a complete evidence trail from source financial data to the final amount reported in the statutory accounts.
- Country-by-country reporting data for all Macquarie jurisdictions is produced as a natural by-product of the monthly provision process, eliminating the separate manual workpapers the Group Tax team currently maintains in parallel.

## Known Constraints

- **APRA CPS 230 (Operational Risk Management)** — the tax provision process and its supporting systems are subject to the CPS 230 standard. Material service providers must be under documented contracts with audit rights and exit clauses; operational continuity plans must be maintained and tested.
- **AASB 112 / IAS 12 (Tax Effect Accounting)** — the deferred tax computation must comply with Australian accounting standards. The calculation methodology must be independently auditable and separately documented from management estimates and judgements.
- **SOX Section 404** — for Macquarie's US-listed entities, IT general controls over the tax provision process are subject to annual external audit. Access management, change management, and data integrity controls are mandatory and must be demonstrable to external auditors.
- **ATO obligations** — tax records and supporting workpapers must be retained for a minimum of 10 years. Country-by-country reporting data must be lodgeable with the ATO in the format prescribed under OECD BEPS Action 13.
- **Oracle Tax Reporting Cloud (TRCS) is the designated golden source for tax provision** — the solution must extend and integrate with Oracle TRCS; no alternative tax provision platform may be adopted without a separate architecture decision ratified by the lead architect.
- **Oracle Cloud platforms are SaaS** — Oracle Fusion GL, FCCS, and TRCS are cloud-hosted SaaS applications. No server-side customisation is permitted; all integrations must use Oracle-approved extension and API patterns.
- **Corporate Data House (CDH) on AWS is the designated enterprise data platform** — all reporting outputs from the tax provision process must feed into CDH; no separate reporting store may be created.
- **Identity and access control** — user access to all finance and tax systems must be provisioned through the Group's central identity provider. No local user accounts may exist in any system. Access to tax data is restricted to the Group Tax team and is subject to quarterly recertification.

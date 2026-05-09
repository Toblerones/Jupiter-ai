# Requirements — Invoice Modernisation

## Stakeholders
- Business Owner: Sarah Chen (Head of Finance)
- Technical Owner: Raj Patel (IT Lead)

## Scope

### In Scope
- Invoice intake and processing workflow
- Integration with Sage finance system
- AI-assisted invoice classification
- GDPR-compliant supplier data handling

### Out of Scope
- Replacement of Sage
- Customer-facing payment portals

## Functional Requirements

### REQ-F-INV-001
**Description**: The system must allow finance clerks to submit and approve invoices through a web interface.
**Acceptance Criteria**: Clerks can complete the workflow without manual rekeying.
**Traces To**: Faster invoice turnaround

### REQ-F-INV-002
**Description**: The system should provide visibility into invoice status for relevant users.
**Acceptance Criteria**: Users can see where an invoice is in the process.
**Traces To**: Better visibility into the status of invoices

### REQ-F-AI-001
**Description**: The system must use AI to automatically classify and extract data from invoices.
**Acceptance Criteria**: AI extraction works on incoming invoices.
**Traces To**: Investigate whether AI could help classify or extract invoice data

## Non-Functional Requirements

### REQ-NFR-PERF-001
**Description**: The system must be fast and responsive when processing invoices.
**Acceptance Criteria**: Performance should be appropriate for the user load.
**Traces To**: Faster invoice turnaround

### REQ-NFR-SCALE-001
**Description**: The system should handle a growing volume of invoices.
**Acceptance Criteria**: System scales as needed.
**Traces To**: Be able to handle a growing volume of invoices

## Compliance Requirements

### REQ-C-GDPR-001
**Description**: The system must comply with GDPR for supplier data.
**Acceptance Criteria**: Supplier data handling meets GDPR requirements.
**Traces To**: GDPR constraint

# Requirements — Invoice Modernisation

## Stakeholders
- Business Owner: Sarah Chen (Head of Finance)
- Technical Owner: Raj Patel (IT Lead)

## Source Analysis

### Ambiguities
- **"modernise"** — could mean workflow redesign, technology refresh, or both. Interpretation chosen: workflow redesign with technology updates as needed to support it. Reason: the rest of the intent describes process pain, not infrastructure pain.
- **"users"** — intent does not name specific roles. Interpretation chosen: invoice clerks (submitters), approvers (managers signing off), and finance leads (viewing aggregate status). Suppliers excluded — out of scope per Sarah's prior note.
- **"frustration"** — interpreted as the operational pain stated elsewhere in the intent (slow turnaround, errors, lack of visibility) rather than UI/UX dissatisfaction. Architect to confirm.
- **"compliance pressures"** — only GDPR is named explicitly. Interpretation chosen: GDPR is the active constraint; no other regulations assumed unless declared in project.yml.

### Gaps
- **Approver and supplier-side stakeholders not named in intent.** Disposition: assumed-here (approvers in scope; suppliers out of scope).
- **No measurable thresholds for "faster", "fewer errors", "growing volume".** Disposition: will-ask-architect — proposed thresholds below in NFR section, marked for confirmation.
- **No mention of integrations beyond Sage.** Disposition: defer-to-design — design phase to confirm landscape inventory.

### Speculative Content
- **"Investigate whether AI could help classify or extract invoice data automatically"** — exploratory phrasing. Recommendation: **spawn-discovery**. Suggested initiative: `discovery-ai-invoice-extraction` to evaluate feasibility, accuracy thresholds, and integration cost. Not converted to a REQ. Once discovery converges, it may produce a follow-on requirement or be dropped.

## Scope

### In Scope
- Invoice intake workflow (submission)
- Invoice approval workflow
- Invoice status visibility for clerks, approvers, and finance leads
- Integration with Sage finance system
- GDPR-compliant supplier data handling

### Out of Scope
- Replacement of Sage (constraint)
- Customer-facing payment portals
- Supplier-facing self-service portals
- AI-assisted classification (deferred to discovery initiative)

## Functional Requirements

### REQ-F-INV-001: Invoice submission
**Description**: The system shall allow finance clerks to submit invoices through a web interface, including all line-item details required for matching.
**Acceptance Criteria**: A clerk can submit a complete invoice in a single web session without manual rekeying of supplier or line-item data already present in the source document.
**Traces To**: Faster invoice turnaround; Fewer errors

### REQ-F-INV-002: Invoice approval
**Description**: The system shall allow designated approvers to approve or reject submitted invoices with a documented rationale for rejections.
**Acceptance Criteria**: Approvers can act on a queue of pending invoices and the action plus rationale is captured on the invoice record.
**Traces To**: Faster invoice turnaround; Fewer errors

### REQ-F-INV-003: Invoice status visibility
**Description**: The system shall display the current status of each invoice (submitted / pending approval / approved / rejected / paid) to clerks, approvers, and finance leads.
**Acceptance Criteria**: A user with the appropriate role can locate an invoice and see its current status and the timestamp of the last status change.
**Traces To**: Better visibility into invoice status

### REQ-F-INV-004: Sage integration
**Description**: The system shall transmit approved invoices to Sage for payment processing without manual re-entry.
**Acceptance Criteria**: Approved invoices appear in Sage within an agreed window with the correct supplier, amount, and reference fields populated.
**Traces To**: Constraint — Sage integration

## Business Rules

### REQ-BR-INV-001: Segregation of duties
**Description**: An invoice must not be approved by the same person who submitted it.
**Acceptance Criteria**: An approval action where approver_id == submitter_id is rejected by the system.
**Traces To**: Fewer errors that result in payment delays (audit-driven control)

## Non-Functional Requirements

### REQ-NFR-PERF-001: Submission latency
**Description**: The system shall accept and persist a submitted invoice within 3 seconds at the 95th percentile under a load of 50 concurrent clerks.
**Acceptance Criteria**: Synthetic load test at 50 concurrent clerks shows p95 submission latency < 3000ms over a 10-minute steady-state window.
**Traces To**: Faster invoice turnaround

### REQ-NFR-SCALE-001: Volume capacity
**Description**: The system shall support a steady-state throughput of 1500 invoices per month with peak daily load of 150 invoices, without degradation of REQ-NFR-PERF-001.
**Acceptance Criteria**: Load test demonstrates the peak day profile while REQ-NFR-PERF-001 acceptance criterion continues to hold.
**Traces To**: Handle growing volume without proportional headcount

### REQ-NFR-ERR-001: Error rate
**Description**: The system shall reduce the rate of invoices requiring manual correction after submission to below 2% of all submissions.
**Acceptance Criteria**: Over a 30-day measurement window, fewer than 2% of submitted invoices are reopened or corrected after the initial submit action.
**Traces To**: Fewer errors that result in payment delays

## Compliance Requirements

### REQ-C-GDPR-001: Supplier data minimisation
**Description**: The system shall store only the supplier personal data necessary for invoice processing and shall expire records per the supplier-data retention policy.
**Acceptance Criteria**: A field-level audit confirms no personal data beyond the documented set is stored; retention job removes records past the retention horizon.
**Traces To**: Stay compliant with supplier data handling rules

### REQ-C-GDPR-002: Subject access support
**Description**: The system shall support supplier subject access requests within the regulatory deadline.
**Acceptance Criteria**: A subject access request for a supplier produces a complete extract within the GDPR statutory window.
**Traces To**: Stay compliant with supplier data handling rules

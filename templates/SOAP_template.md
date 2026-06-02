# Solution Architecture (SOAP) - Template V2
> Source: JUP-SAD_template.pdf (Template - Solution Architecture (SOAP) V2)
> Converted: 2026–03–24
>
> This SOAP is intentionally high-level, focused on the business problem and proposed solution.
> Detailed Specifications, such as Data, Security and similar concerns, are captured in dedicated architecture artifacts.
 - -
## Document Control
| Field | Value |
| - - - - - - - - - | - - - - - - - - - - - - - - - - - - - - - - - |
| Reference | |
| Version | [e.g. 0.1.0-draft] |
| Status | [STATUS] |
| Owner | |
| Consulted | |
| Informed | |
| Endorsed | Date: |
| Architecture Epic | |
### Revision History
| Version | Who | Date | Description |
| - - - - -| - - -| - - - | - - - - - - -|
| 0.1 | | | |
### Review History
| Date | Who | Comments |
| - - - | - - -| - - - - - |
| | | |
### Related Documents
| Title | Link | Reason |
| - - - -| - - - | - - - - |
| 1 | | |
| 2 | | |
 - -
## 1. Executive Summary
### 1.1 Problem Statement
High-level description of the business and/or regulatory problem being addressed.
> [REPLACE: Describe the business or regulatory problem. Be specific - vague problems produce vague architectures.]
### 1.2 Business Drivers
Key drivers motivating this initiative (e.g. compliance, efficiency, scalability).
> [REPLACE: Bulleted list of primary drivers. Each driver should be concrete and attributable.]
### 1.3 Success Measures
High-level success criteria used to evaluate outcomes.
> [REPLACE: How will success be measured? Include KPIs, compliance milestones, or capability outcomes.]
 - -
## 2. Business Context & Requirements
### 2.1 Business Scope
| | |
|-| - |
| **In Scope** | [List what is explicitly in scope - name systems, entities, transaction types, geographies] |
| **Out of Scope** | [List what is explicitly out of scope - undeclared scope becomes implicit scope] |
### 2.2 Regulatory & Policy Drivers
Key regulatory, tax, compliance, or policy obligations influencing the solution.
> [REPLACE: Reference specific mandates by name and effective date. If none apply, state explicitly.]
### 2.3 High-Level Business Requirements
List of business requirements expressed at a capability or outcome level.
| # | Business Requirement | Link |
| - -| - - - - - - - - - - -| - - - |
| 1 | | |
| 2 | | |
 - -
## 3. Current State Snapshot
*This is a lightweight contextual view - not a full as-is design.*
### 3.1 Current Process Overview
Brief description of how the capability currently operates.
> [REPLACE: Describe the current end-to-end process. Include who does what, how data moves, and where manual steps exist.]
### 3.2 Key Systems & Platforms Involved
List of relevant systems involved in the current state.
| Component / System Name | CMDB Link |
| - - - - - - - - - - - - -| - - - - - -|
| | |
### 3.3 Constraints & Pain Points
| Category | Description |
| - - - - - - -| - - - - - - -|
| **Technical** | [Technical constraints and limitations] |
| **Operational** | [Operational constraints and pain points] |
| **Compliance** | [Compliance gaps or constraints] |
 - -
## 4. Business Architecture
*This section defines the business view that drives architectural decisions.*
### 4.1 Value Streams
End-to-end value streams impacted by this initiative.
> [REPLACE: For each value stream - name, start trigger, end outcome, and how this architecture changes it.]
### 4.2 Business Capabilities
Business capabilities enabled or enhanced by the solution.
> [REPLACE: Map to the FPE BlueBook capability IDs where applicable (Buy/Hold/Sell disposition).]
### 4.3 Impacted Business Processes
Only processes that change due to this solution.
> [REPLACE: For each impacted process - process name, current state, future state, teams affected.]
 - -
## 5. Target State Architecture
*Defines the long-term guiding architecture aligned with enterprise direction.*
### 5.1 Target Capability Alignment
How the long-term architecture supports business capabilities.
> [REPLACE: Confirm each capability from §4.2 is addressed in the target state.]
### 5.2 Conceptual Logical Architecture
High-level conceptual view of the target architecture (technology-agnostic).
> [REPLACE: Show major capability blocks and how they relate. A Mermaid or ASCII diagram is strongly recommended - this is the "30,000 ft" view.]
```
[Architecture diagram - Mermaid or ASCII]
```
### 5.3 Architecture Principles & Guardrails
Key principles, standards, and constraints guiding solution design.
> [REPLACE: Include both inherited organisational principles and initiative-specific principles.]
### 5.4 Technology & Platform Standards
Approved platforms, cloud providers, and enterprise technology standards this solution must conform to. Reference enterprise architecture standards or approved product lists where applicable.
| Category | Approved Standard / Platform | Notes / Constraints |
| - - - - - | - - - - - - - - - - - - - - - | - - - - - - - - - - -|
| Cloud Provider (e.g. AWS ap-southeast-2) | | |
| Container Platform (e.g. EKS, OpenShift) | | |
| API Gateway | | |
| Identity Provider | | |
| Messaging / Eventing | | |
| Observability Stack | | |
| CI/CD Toolchain | | |
| Database Platform | | |
| Other | | |
 - -
## 6. Solution Architecture
*Represents the realisable subset of the Target State delivered by this initiative.*
### 6.1 Solution Overview
Summary of the solution and its responsibilities.
> [REPLACE: What is being built or changed, the primary architectural pattern chosen, and the key reasons for the approach. Reference the most significant ADRs.]
### 6.2 Logical Application Architecture
Logical components and interactions.
> [REPLACE: Component breakdown - name, responsibility, key interfaces (exposes / consumes), and REQ-ARCH keys addressed.]
### 6.3 Integration Architecture
- Integration patterns
- Key inbound/outbound interfaces
- Ownership boundaries
> [REPLACE: Integration patterns (sync API, async messaging, file-based, event-driven). Data contracts for critical integration points.]
### 6.4 Deployment Architecture Overview
*High-level deployment only - details in Infrastructure Architecture.*
#### 6.4.1 Prod
- Environment overview
- Hosting model
- High-level resilience approach
> [REPLACE: Production deployment - components, infrastructure topology, availability design.]
#### 6.4.2 Non-Prod
> [REPLACE: Non-production environments (dev, test, UAT, staging). How they differ from prod and how deployments flow between them.]
### 6.5 Security Architecture Overview
*High-level security view - detailed controls may live elsewhere.*
- Threat Modelling reference
- IAM approach
- Trust boundaries
- Data protection principles
> [REPLACE: Authentication and authorisation model, data protection at rest and in transit, trust boundaries. Reference REQ-ARCH-S-* requirements and relevant ADRs.]
### 6.6 Data Architecture Overview
*Contextual only - detailed models and mappings live in Data Architecture.*
- Data Products
- Key data flows
- Systems of record
- Ownership and custody
> [REPLACE: Key entities, storage choices, data flow through system, data residency (especially for regulatory requirements), data lifecycle - retention, archival, deletion.]
### 6.7 Cost Architecture Overview
*High-level cost view - detailed FinOps analysis lives in the cost management tooling. The intent here is to surface cost-relevant architectural decisions early.*
**FinOps Alignment**
Cost tagging strategy: [REPLACE]
Budget owner: [REPLACE]
Cost centre / WBS code: [REPLACE]
Key cost optimisation levers identified: [REPLACE]
| Area | Consideration | Estimated Impact | Notes |
| - - - | - - - - - - - | - - - - - - - - -| - - - -|
| Compute | Reserved vs on-demand, right-sizing | | |
| Storage | Tiering, retention, egress | | |
| Networking | Cross-AZ traffic, data transfer costs | | |
| Licensing | BYOL, SaaS per-seat, API calls | | |
| Operational | Support tiers, managed services premium | | |
 - -
## 7. Architecture Decision Records (Summary)
*Detailed ADRs are maintained in separate linked pages. ADRs live in `specification/adrs/` following the naming convention `ADR-S-{NNN}-{slug}.md`.*
| ADR | Ticket | Link | Approval Level | Approvers | Associated Risk | Decision Date | Decision Type | Other Stakeholders | Outcome | Owner | Project / Initiative |
| - - -| - - - - | - - - | - - - - - - - -| - - - - - -| - - - - - - - - | - - - - - - - -| - - - - - - - -| - - - - - - - - - - | - - - - -| - - - -| - - - - - - - - - - - |
| | | | | | | | | | | | |
 - -
## 8. Non-Functional Architecture
*State what is required, not how it will be implemented. Detailed NFR specifications live in the separated architecture NFR or Infrastructure and Operations design documents.*
**Summary Table**
| # | Category | Requirement | Target / Expectation | Notes |
| - -| - - - - - | - - - - - - -| - - - - - - - - - - -| - - - -|
| 1 | Performance | Peak throughput | e.g. 500 TPS | |
| 2 | Performance | Response time (p95) | e.g. < 300 ms | |
| 3 | Availability | Uptime SLA (prod) | e.g. 99.9% | |
| 4 | Resilience | RTO / RPO | e.g. 4 hr / 1 hr | |
| 5 | Scalability | Scaling model | e.g. horizontal auto-scaling | |
| 6 | Security | Authentication standard | e.g. OAuth 2.0 / MFA enforced | |
| 7 | Compliance | Data retention | e.g. 7 years | |
| 8 | Observability | Audit logging | e.g. all API access logged | |
### 8.1 Performance & Scalability
*Define measurable targets. Reference load profiles or capacity models where available.*
| Requirement | Target | Rationale / Notes |
| - - - - - - -| - - - - | - - - - - - - - - -|
| Peak throughput | e.g. 500 TPS | |
| Average response time (p95) | e.g. < 300 ms | |
| Batch processing window | e.g. complete within 2hr nightly | |
| Concurrent users | | |
| Horizontal scalability model | e.g. auto-scaling, manual | |
| Data volume growth (12-month) | | |
### 8.2 Resilience & Availability
*Define availability targets and failure handling expectations per environment.*
| Requirement | Target | Notes |
| - - - - - - -| - - - - | - - - -|
| Availability SLA (prod) | e.g. 99.9% | |
| RTO (Recovery Time Objective) | e.g. < 4 hrs | |
| RPO (Recovery Point Objective) | e.g. < 1 hr | |
| Failover approach | e.g. active-passive, active-active | |
| Degraded mode behaviour | e.g. read-only, circuit breaker | |
| Backup frequency & retention | | |
| DR test frequency | | |
### 8.3 Operations & Observability
*Define what is monitored, how it is logged, and who owns it operationally.*
| Area | Approach | Owner |
| - - - | - - - - - | - - - -|
| Application logging | e.g. structured JSON to Splunk | |
| Infrastructure metrics | e.g. CloudWatch dashboards | |
| Distributed tracing | e.g. X-Ray, Jaeger | |
| Alerting & on-call | e.g. PagerDuty, runbook links | |
| Health checks / synthetic monitoring | | |
| Incident management integration | | |
| Operational runbook location | | |
### 8.4 Audit & Compliance
*Define auditability and traceability requirements. Reference applicable standards or policies.*
| Requirement | Control | Applicable Standard / Policy | Notes |
| - - - - - - -| - - - - -| - - - - - - - - - - - - - - - | - - - -|
| API access audit trail | e.g. AWS CloudTrail | | |
| Data access logging | | | |
| Change management traceability | | | |
| Data retention & disposal | e.g. Privacy Act, record-keeping policy | | |
| PII / sensitive data handling | | | |
| Regulatory reporting | | | |
 - -
## 9. Delivery, Risks & Dependencies
### 9.1 Risks
*High-level architectural and delivery risks. Detailed risk management is tracked in the project risk register.*
| # | Risk | Category | Likelihood | Impact | Mitigation | Owner |
| - -| - - - | - - - - - | - - - - - -| - - - - | - - - - - - | - - - -|
| 1 | | Technical / Delivery / Compliance / Vendor | H/M/L | H/M/L | | |
| 2 | | | | | | |
### 9.2 Assumptions
*Key assumptions underpinning the architecture.*
| # | Assumption | Impact if Invalid |
| - -| - - - - - - | - - - - - - - - - |
| 1 | | |
| 2 | | |
### 9.3 Dependencies
*Key business, technology, or vendor dependencies.*
| # | Dependency | Type | Owner | Status |
| - -| - - - - - - | - - - | - - - -| - - - - |
| 1 | | Business / Technology / Vendor | | |
| 2 | | | | |
### 9.4 Phasing & Transition Notes
*High-level rollout, sequencing, or migration considerations.*
> [REPLACE: If the full target state cannot be reached by the deadline, describe the phased approach. What is delivered in Phase 1, what is deferred, and what architectural technical debt (ATD) is incurred. For each ATD item: description, reason, impact, and remediation path.]
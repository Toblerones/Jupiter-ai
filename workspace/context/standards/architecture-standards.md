# Architecture Standards — Macquarie Group Finance Management
# Applies to: Finance, Tax, Treasury systems
# Owner: Finance Architecture
# Effective: 2025-01-01 | Review cycle: Annual

---

## 1. Architecture Principles

These principles govern all architecture decisions in the Finance Management division. Every ADR must demonstrate alignment with applicable principles or explicitly document why deviation is warranted.

| # | Principle | Implication |
|---|-----------|-------------|
| P-01 | **Oracle-first for core finance** | Oracle Cloud ERP and EPM are the standard platforms for GL, consolidation, planning, reconciliation, and tax provision. Proposals to use alternative platforms in these domains require Finance Architecture approval with documented justification. |
| P-02 | **AWS-first for data and analytics** | CDH (Corporate Data House) on AWS is the standard for enterprise data lake, analytics datasets, and regulatory reporting pipelines. Do not build parallel data stores outside CDH without approval. |
| P-03 | **SaaS before build** | Prefer Oracle Cloud SaaS capabilities over custom development. Extend Oracle using approved extension patterns (Groovy, BPM, Application Composer). Build only when the Oracle capability is genuinely absent. |
| P-04 | **Single source of truth** | Every data element has one golden source (defined in `integration-landscape.yml`). Never create a second authoritative copy. Derived copies must carry lineage back to the golden source. |
| P-05 | **API-first integration** | Integrations use published APIs (Oracle REST, EPM REST, AWS API Gateway). File-based transfers and SFTP are accepted only for legacy or regulatory-mandated interfaces. |
| P-06 | **Event-driven for real-time** | Real-time or near-real-time data flows use Amazon MSK (Kafka). Polling loops that call an API repeatedly are prohibited for production financial data. |
| P-07 | **Least privilege, always** | Every service, user, and process holds only the minimum access required. Privilege is justified and time-bounded for elevated operations. |
| P-08 | **Design for audit** | Every financial transaction and data transformation must produce an immutable audit record. Audit logs are mandatory, not optional, for all tier_1 systems. |
| P-09 | **Regulatory compliance by design** | Compliance obligations (APRA, ASIC, ATO, FATCA, GDPR) are requirements, not afterthoughts. They must appear in the requirements artifact as REQ-C keys and be addressed explicitly in the SAD. |
| P-10 | **Resilience is built in** | Tier_1 systems require: RTO ≤ 4 hours, RPO ≤ 1 hour, defined DR strategy, and automated failover where feasible. These targets are captured in NFR requirements. |

---

## 2. Technology Standards

### 2.1 Approved Technology Tiers

| Tier | Status | Meaning |
|------|--------|---------|
| **Strategic** | Default choice | Actively invested; all new work should use this |
| **Tactical** | Constrained use | Acceptable for specific scenarios; no new net-new adoption |
| **Legacy** | Maintenance only | No new features; migration plan required |
| **Prohibited** | Not permitted | Must not be used in new designs |

### 2.2 Finance Platform Standards

| Capability | Strategic Platform | Tactical | Legacy |
|-----------|------------------|---------|--------|
| General Ledger | Oracle Fusion Cloud Financials | — | — |
| Consolidation | Oracle FCCS | — | Hyperion HFM (migration to FCCS in progress) |
| Planning / Budgeting | Oracle EPBCS | — | — |
| Reconciliation | Oracle ARCS | — | Manual spreadsheet (prohibited for tier_1 accounts) |
| Cost Allocation | Oracle PCM Cloud | — | — |
| Narrative Reporting | Oracle Narrative Reporting | — | — |
| Tax Provision | Oracle TRCS | ONESOURCE (legacy instances only) | — |
| Australian Tax Returns | Alphatax | — | — |
| Treasury / Trading | Murex MX.3 | — | — |
| Integration (Oracle↔Oracle) | Oracle Integration Cloud (OIC) | — | — |
| Enterprise Data Platform | CDH on AWS (S3 + Redshift) | — | — |
| Data Orchestration | Amazon MWAA (Airflow) | — | — |
| ETL / Transformation | AWS Glue | — | — |
| Streaming | Amazon MSK | — | — |
| BI / Board Reporting | Power BI (Fabric) | Oracle Analytics Cloud (OAC) | — |
| Identity | Azure AD (Entra ID) + Oracle IDCS | — | — |
| Secret Management | OCI Vault (Oracle apps), AWS KMS / Secrets Manager (CDH) | Azure Key Vault (legacy) | — |

### 2.3 Programming Languages and Runtimes

| Language | Approved uses |
|---------|-------------|
| Python 3.11+ | AWS Glue ETL, MWAA DAGs, CDH pipelines, scripting |
| Java 17 LTS | OIC custom adapters, standalone microservices |
| SQL | Oracle Fusion analytics (OTBI), Redshift queries, Glue SQL transforms |
| Groovy | Oracle EPM Cloud calculation scripts, Hyperion rules |
| JavaScript / TypeScript | Oracle JET UI extensions (Application Composer), OAC custom visualisations |
| ABAP | Prohibited for new work (no SAP); legacy ABAP adapters must be replaced on a defined schedule |

### 2.4 Prohibited Technologies

- Local user account stores in any Finance system (all identity via Azure AD)
- Shared password credentials for service accounts
- HTTP (non-TLS) for any financial data transmission
- SFTP for new Oracle Cloud integrations (use OIC or AWS Glue)
- Spreadsheets as authoritative data sources for regulatory reporting
- Direct database schema access to Oracle Fusion Cloud (SaaS architecture prohibits this)

---

## 3. Integration Patterns

### 3.1 Synchronous API Integration (Oracle REST)

**When to use**: User-initiated actions, low-latency lookups, single-record creates/updates.

**Pattern**:
```
Consumer → OIC REST Trigger → Oracle Fusion REST Invoke → Response
```
- Use Oracle Integration Cloud (OIC) as the mediation layer for authentication, error handling, and logging.
- OAuth2 client credentials (OCI IAM service account) for service-to-service calls.
- Apply RFC 7807 error responses on all failure paths.
- Circuit breaker pattern via OIC error handling; alert on consecutive failures.

**Standards**:
- Idempotency key required on all mutating operations (POST, PATCH).
- Timeout: 30 seconds maximum for synchronous Oracle REST calls; surface to caller if exceeded.
- Retry: 3 attempts with exponential backoff (1s, 2s, 4s); alert after 3 failures.

### 3.2 Asynchronous Event Integration (Amazon MSK)

**When to use**: High-volume financial events (journal posts, trade events, position snapshots), decoupled producers/consumers, audit streams.

**Pattern**:
```
Source System → OIC Kafka Adapter / AWS Lambda → MSK Topic → CDH Consumer (Glue / Lambda)
```
- Schema-first: all events must have an Avro schema registered in AWS Glue Schema Registry before the topic is created.
- Topic naming: `{domain}.{subdomain}.{entity}.{event-type}.{version}` — e.g. `finance.gl.journal.posted.v1`
- Partitioning key: entity ID or legal entity code for financial events (ensures ordering per entity).
- Consumer groups: each downstream system uses a named consumer group; no anonymous consumers.
- Dead-letter topic: mandatory for all consumers; unprocessable messages land in `{topic-name}.dlq`.

**Standards**:
- Events are immutable; never delete or modify a committed event.
- Event schema evolution must be backwards-compatible (new optional fields only); breaking changes require a new version topic.
- Retention: 7 days on MSK; critical financial events also written to S3 Bronze for 90-day retention.

### 3.3 Bulk Batch Integration (AWS Glue / S3)

**When to use**: Period-end data loads, trial balance extraction, large dataset transfers between Oracle Cloud and CDH.

**Pattern**:
```
Oracle Cloud (BICC/BIP Extract) → OIC File Adapter → S3 Bronze → Glue Job (validate + transform) → S3 Silver → Glue Job (conform + enrich) → Redshift Gold
```
- See data pipeline standards (`data-pipeline-standards.md`) for full medallion pipeline specification.
- All batch loads must produce a control total record (row count, sum of key financial amounts).
- Reconciliation job runs automatically after load; discrepancy > 0.01% of total blocks Silver promotion and raises P1 alert.
- Batch windows: Oracle Finance batch loads must complete before 06:00 AEST to clear for business day reporting.

### 3.4 Oracle-to-Oracle Integration (OIC)

**When to use**: Any integration between two Oracle Cloud applications (Fusion GL → FCCS, Fusion GL → ARCS, Fusion GL → TRCS, EPBCS → FCCS).

**Pattern**:
```
Oracle App A (REST/EPM API) → OIC Integration Flow → Oracle App B (REST/EPM API)
```
- OIC is mandatory for all Oracle-to-Oracle integrations; direct app-to-app calls are prohibited.
- All OIC integration flows must be stored in the Finance Architecture GitLab repository under `/oic-integrations/{domain}/`.
- Error notification: OIC fault handler must send to the `finance-arch-alerts` SNS topic (routed to PagerDuty for tier_1 integrations).
- OIC integration flows are version-tagged; do not modify a deployed flow without creating a new version.

---

## 4. Security Standards

### 4.1 Authentication

| Scenario | Standard |
|---------|---------|
| Human → Oracle Cloud | Azure AD SSO → Oracle IDCS federation → Oracle Fusion |
| Human → CDH / AWS Console | AWS IAM Identity Centre federated to Azure AD |
| Human → Power BI | Azure AD SSO |
| Service → Oracle REST API | OCI IAM service account; OAuth2 client credentials |
| Service → AWS (S3, Redshift, MSK) | AWS IAM role with resource-based policies; no long-term access keys |
| Service → Service (cross-cloud) | OAuth2 client credentials; secret stored in OCI Vault or AWS Secrets Manager |

### 4.2 Authorisation

- **Oracle Cloud**: role-based data roles provisioned via Oracle Identity Governance (OIG); Azure AD group membership drives OIG role assignment.
- **CDH / AWS**: Lake Formation tag-based access control; no S3 bucket policies that grant broad access.
- **Redshift**: Schema-level grants via Redshift roles; no individual user grants.
- **Power BI**: Row-level security (RLS) configured on all datasets containing entity-level financial data.

### 4.3 Secrets Management

- Secrets (API keys, OAuth credentials, database passwords) must be stored in OCI Vault (Oracle workloads) or AWS Secrets Manager (AWS workloads).
- No secrets in source code, configuration files committed to git, or environment variables in container images.
- Rotation: automated 90-day rotation for all service credentials; manual rotation triggers alert.

### 4.4 Network Security

- Oracle Cloud: OCI Security Zones enforce that no Oracle Finance workloads have public internet exposure; all access via private endpoints or OCI FastConnect.
- CDH (AWS): All S3 buckets block public access; MSK clusters in private VPC subnets; Redshift in isolated VPC with no internet gateway.
- Cross-cloud (OCI ↔ AWS): Traffic via AWS Direct Connect + OCI FastConnect private peering; no traffic over public internet.
- Power BI to Redshift: Power BI On-Premises Data Gateway deployed in AWS VPC.

---

## 5. Reliability Standards

### 5.1 Availability Tiers

| Tier | Availability Target | RTO | RPO | DR Strategy |
|------|-------------------|-----|-----|-------------|
| tier_1 | 99.9% (< 8.7 h downtime/year) | 4 hours | 1 hour | Active-passive with automated failover |
| tier_2 | 99.5% (< 43.8 h downtime/year) | 8 hours | 4 hours | Warm standby |
| tier_3 | 99% (< 87.6 h downtime/year) | 24 hours | 8 hours | Cold standby / restore from backup |

### 5.2 Oracle Cloud SaaS Reliability

- Oracle Cloud SaaS services have Oracle-managed availability SLAs. Designs must account for Oracle maintenance windows (typically Fridays 22:00–02:00 AEST).
- Business continuity plans must include manual fallback procedures for period-close activities if Oracle Cloud is unavailable during the close window.

### 5.3 CDH (AWS) Reliability

- S3: 99.999999999% (11 9s) durability; cross-region replication enabled for Gold layer to ap-southeast-1.
- MSK: Multi-AZ cluster; automatic partition leader failover.
- Redshift: Multi-AZ deployment; automated snapshots every 8 hours; cross-region snapshot copy to ap-southeast-1.
- MWAA: Managed service; scheduler HA by default.

---

## 6. Observability Standards

All tier_1 Finance Management systems must implement:

| Signal | Standard | Tool |
|--------|---------|------|
| **Structured logs** | JSON format; include: timestamp, correlation-id, user/service-id, REQ-key (if applicable), event-type, severity | AWS CloudWatch Logs (CDH); OIC Monitoring (Oracle) |
| **Metrics** | Business metrics: pipeline throughput, GL posting volumes, reconciliation pass rate; Technical: latency, error rate, saturation | Amazon CloudWatch (CDH); Oracle Cloud Observability (OIC) |
| **Traces** | Distributed tracing across OIC → Oracle → CDH flows using W3C TraceContext propagation | AWS X-Ray (CDH leg); OIC built-in trace ID |
| **Alerts** | P1 alerts page on-call via PagerDuty; P2 alerts notify via email/Teams | Amazon SNS → PagerDuty; OIC fault alert → SNS |
| **Dashboards** | Operational dashboard per domain maintained in Amazon CloudWatch; executive metrics in Power BI | CloudWatch, Power BI |

**Correlation ID**: every financial event must carry a correlation ID that propagates end-to-end across OIC, Oracle Fusion, MSK, and CDH. This ID must appear in all log entries related to that event and is the primary handle for incident investigation.

---

## 7. Change Management Standards

| Change Type | Approval | Testing Required | Lead Time |
|-------------|---------|-----------------|-----------|
| Oracle Cloud metadata (entities, accounts, dimensions) | EPM Governance Council | SIT regression in OCI test env | 10 business days |
| Oracle Cloud quarterly update readiness | Finance Architecture | Full regression in OCI test env | 4 weeks before update |
| New OIC integration flow | Finance Architecture peer review | SIT + UAT | 5 business days |
| CDH pipeline (new) | Data Governance + Finance Architecture | DEV → SIT → PROD pipeline promotion | 5 business days |
| CDH pipeline (schema change) | Data Governance | Schema registry version bump + consumer readiness check | 3 business days |
| Murex configuration | Treasury Technology + Group Risk | SIT + market data reconciliation | 10 business days |
| SWIFT message type change | Treasury Operations | SWIFT test environment + UAT | 15 business days |
| Production data access (elevated) | Data Owner | PIM JIT activation + change record | Same-day (emergency) / 2 business days (planned) |

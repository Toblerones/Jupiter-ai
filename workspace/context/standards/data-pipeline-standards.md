# Data Pipeline Standards — Macquarie Group Finance Management
# Domain: CDH (Corporate Data House) on AWS
# Owner: Finance Architecture — Data Engineering
# Effective: 2025-01-01 | Review cycle: Annual

---

## 1. Overview

The Corporate Data House (CDH) follows a **medallion architecture** (Bronze / Silver / Gold) on Amazon S3, with Amazon Redshift as the serving layer and Amazon MSK as the streaming backbone. This document defines the mandatory standards for all data pipelines ingesting Finance, Tax, and Treasury data into CDH.

All pipelines must conform to these standards before promotion to the Silver layer or before any downstream consumer (Power BI, regulatory reporting, APRA Connect) may use the data.

---

## 2. Medallion Architecture

```
Sources                   Bronze (S3)          Silver (S3)          Gold (Redshift)
─────────────────────     ──────────────────   ──────────────────   ─────────────────────────
Oracle Fusion GL     ──►  Raw landing          Validated,           Conformed, business-ready
Oracle FCCS          ──►  Immutable            deduped,             dimensional model
Oracle TRCS          ──►  Partitioned          typed,               aggregated datasets
Murex                ──►  by source+date       lineage tagged,      certified for reporting
Alphatax (batch)     ──►                       PII masked
MSK (streaming)      ──►  Micro-batch          Streaming            Materialised views
                          checkpoint           silver table          for near-real-time
```

### 2.1 Bronze Layer

**Purpose**: Raw, unmodified data exactly as received from the source system. The Bronze layer is the immutable record of what arrived.

**Standards**:
- S3 path: `s3://cdh-{env}-bronze/{domain}/{source-system}/{date-partition}/`
  - Example: `s3://cdh-prod-bronze/finance/oracle-fusion-gl/2026/03/31/`
- File format: Parquet preferred; JSON accepted for event data; CSV accepted for FBDI/Oracle extracts with schema definition in Glue Catalog.
- Compression: Snappy for Parquet; gzip for JSON/CSV.
- Partitioning: by `ingestion_date=YYYY-MM-DD/` at minimum; add `source_system=` prefix for shared domains.
- Immutability: Bronze files are **never modified or deleted** after writing. Corrections are handled in Silver.
- Encryption: SSE-KMS with CDH Bronze KMS key (customer-managed, domain-specific key per data classification level).
- Lineage metadata: every Bronze file must have S3 object tags: `source-system`, `domain`, `pipeline-id`, `ingestion-timestamp`, `data-classification`.
- Control file: every batch load drops a `_SUCCESS` manifest file containing: row count, file list, source system extract timestamp, pipeline run ID.
- Retention: 7 years (aligned to regulatory record-keeping requirements).

### 2.2 Silver Layer

**Purpose**: Validated, deduplicated, typed, PII-masked data ready for analytical consumption. The Silver layer is the canonical version of the data.

**Standards**:
- S3 path: `s3://cdh-{env}-silver/{domain}/{entity}/`
  - Example: `s3://cdh-prod-silver/finance/gl-journal-lines/`
- File format: Parquet (mandatory); Delta Lake format for entities requiring ACID transactions and CDC (e.g., open AR balances, position snapshots).
- Partitioning: by `accounting_date=` or `business_date=` for financial data; `fiscal_year=` + `fiscal_period=` for period-end data.
- Schema: defined and versioned in AWS Glue Data Catalog; schema changes require version bump (see §6 Schema Management).
- Data quality gates (all must pass before promotion):
  - Completeness check: mandatory fields non-null ≥ 99%.
  - Accuracy check: reconciliation total matches control file ± 0.01%.
  - Validity check: domain rules (e.g., GL account exists in CoA, entity code is valid LEI).
  - Timeliness check: data available within agreed SLA window.
- PII masking: all PII fields masked or tokenised using AWS Macie-identified fields + CDH PII masking rules; raw values never persist in Silver.
- Deduplication: event-sourced data must be deduplicated by natural key + source timestamp; last-write-wins for slowly changing data.
- Lineage: every Silver record carries: `source_pipeline_id`, `bronze_s3_path`, `silver_loaded_at`, `transformation_version`.
- Retention: 7 years.

### 2.3 Gold Layer (Amazon Redshift)

**Purpose**: Business-ready, conformed datasets optimised for reporting, analytics, and regulatory submissions.

**Standards**:
- Redshift cluster: isolated cluster per environment (prod, non-prod); Multi-AZ deployment for prod.
- Schema layout: one Redshift schema per domain (`finance`, `tax`, `treasury`, `regulatory`); cross-domain joins via shared dimension schemas (`dim_entity`, `dim_coa`, `dim_date`).
- Table types:
  - **Fact tables**: transactional (journal lines, trade events); append-only; no updates after period close lock.
  - **Dimension tables**: slowly changing dimension type 2 (SCD2) for entities, cost centres, CoA.
  - **Aggregate tables**: pre-computed summaries for board reporting; refreshed on schedule.
  - **Materialised views**: for near-real-time reporting from streaming Silver tables.
- Distribution style: `KEY` on `entity_id` or `legal_entity_code` for fact tables; `ALL` for small dimension tables.
- Sort key: `accounting_date` as leading sort key for financial fact tables.
- Compression: Redshift native compression (AZ64 for string columns, DELTA32K for date columns).
- Access: Lake Formation column-level security; no direct Redshift user grants.
- Certification: datasets must be certified by Finance Architecture and the domain Data Steward before BI tools may connect.
- Retention: 7 years in Redshift; data beyond 2 years is tiered to Redshift Spectrum (S3 Silver).

---

## 3. Ingestion Patterns

### 3.1 Full Extract (Oracle Cloud Financials)

**Use case**: Initial load or full period snapshot of GL trial balance, entity master, CoA.

**Pattern**:
```
Oracle Fusion GL
  → BICC (Business Intelligence Cloud Connector) extract
  → OIC File Adapter (outbound to S3)
  → S3 Bronze (Parquet)
  → Glue Job: validate + deduplicate
  → S3 Silver
  → Glue Job: conform + load
  → Redshift Gold
```

**Standards**:
- BICC extracts are scheduled via OIC; extract window must complete before batch SLA (06:00 AEST).
- Full extract replaces the Silver partition for the extracted date; previous partitions are not modified.
- After every full extract, run reconciliation job comparing Redshift Gold total to Oracle Fusion GL trial balance report; block Gold load if variance > 0.01%.

### 3.2 Incremental / Delta Extract (Change Data Capture)

**Use case**: Daily journal line extracts, incremental AR ageing, incremental position updates.

**Pattern**:
```
Oracle Fusion GL (last_update_date filter via BICC incremental view)
  → OIC
  → S3 Bronze (delta Parquet, partitioned by extraction_timestamp)
  → Glue Job: apply CDC (upsert into Silver Delta table using natural key)
  → Silver (Delta Lake MERGE)
  → Glue Job: incremental append to Redshift Gold (append new records; update SCD2 dimensions)
```

**Standards**:
- CDC key: `(journal_line_id, journal_batch_id, ledger_id)` for GL journal lines; documented per entity in the Glue Catalog.
- Idempotency: pipelines must be idempotent; re-running a delta pipeline for the same window must not create duplicates (use Delta Lake MERGE).
- Late-arriving data: data arriving > 24 hours after its accounting date is classified as late-arriving; pipeline emits a `late_data_alert` event to the `finance.pipeline.alerts` MSK topic.

### 3.3 Streaming Ingest (Amazon MSK)

**Use case**: Murex real-time trade events, MTM position snapshots, intraday liquidity events.

**Pattern**:
```
Murex (Kafka producer via MxML adapter)
  → MSK Topic: treasury.murex.trades.created.v1
  → AWS Lambda consumer: validate schema (Glue Schema Registry) + write to S3 Bronze (micro-batch every 5 min)
  → Glue Streaming Job: read S3 Bronze, apply Silver rules, write to Silver (Delta Lake streaming append)
  → Redshift Materialised View: refreshed every 15 min from Silver
```

**Standards**:
- Schema validation is enforced at the MSK consumer before any data reaches Bronze; invalid messages go to `.dlq` topic and trigger `schema_validation_failed` alert.
- MSK producer acknowledgment: `acks=all` (all in-sync replicas must confirm write) for financial events; `acks=1` not permitted.
- Consumer offset management: committed after successful S3 write, not at receipt; ensures at-least-once delivery.
- Exactly-once semantics: implemented via Delta Lake MERGE in Silver; Silver table is the deduplication boundary.
- Lag monitoring: consumer group lag alert fires if lag > 10,000 messages or > 5 minutes behind; P1 for treasury positions.

### 3.4 File-Based Ingest (Legacy / Regulatory)

**Use case**: Alphatax output files (ATO SBR2), APRA XBRL submissions preparation, legacy system exports.

**Pattern**:
```
Source (SFTP drop or secure file share)
  → AWS Transfer Family (SFTP-to-S3)
  → S3 Bronze (raw file preserved)
  → Glue Job: parse + validate + convert to Parquet
  → S3 Silver
  → (optional) Redshift Gold or direct to regulatory reporting tool
```

**Standards**:
- SFTP is accepted only for regulatory-mandated or legacy-only interfaces; new integrations must not use SFTP.
- AWS Transfer Family is the only approved SFTP-to-S3 gateway; no EC2-based SFTP servers.
- File integrity: SHA-256 checksum of every inbound file is recorded in Bronze metadata; verified before processing.
- File archival: original files retained in Bronze for 7 years; processed files moved to `processed/` prefix within Bronze after Silver promotion.

---

## 4. Transformation Standards

### 4.1 AWS Glue Jobs

- **Language**: Python (PySpark) or Spark SQL; no Scala for new CDH jobs (standardise on Python for Finance team maintainability).
- **Job type**: Glue 4.0 (Apache Spark 3.3); use Glue Streaming for streaming Silver jobs.
- **Library management**: all Python dependencies pinned in `requirements.txt`; packaged as Glue Python wheel and stored in S3 CDH shared assets bucket.
- **Configuration**: no hardcoded values; all environment-specific config (bucket names, Redshift endpoints, KMS key ARNs) in AWS Systems Manager Parameter Store.
- **Error handling**: every Glue job must handle and log individual record failures without failing the entire job; failed records written to `_error/` prefix in Bronze with failure reason.
- **Idempotency**: Glue jobs must be idempotent; re-running for the same partition must produce the same result.

### 4.2 Transformation Rules

| Transformation Type | Standard |
|-------------------|---------|
| Currency conversion | Use FX rates from Bloomberg (golden source); rates loaded daily into `dim.fx_rates` dimension table; never hard-code rates |
| Entity normalisation | Map all entity codes to canonical Legal Entity Identifier (LEI); lookup from `dim.entity` dimension |
| Account mapping | Map source system account codes to Group Chart of Accounts via `dim.coa_mapping` table; no ad-hoc mapping in Glue scripts |
| Date/period | Store all dates as ISO-8601 in UTC; fiscal period derived from `dim.fiscal_calendar` table; never compute fiscal period in Glue job |
| Null handling | Mandatory fields: fail the record on null (write to error); optional fields: preserve null, do not replace with zero or empty string |
| Financial amounts | Store as DECIMAL(28, 10); never use floating-point (FLOAT/DOUBLE) for financial amounts |
| PII masking | Apply CDH tokenisation library (`cdh-pii-mask` Python package); masking applied in Bronze-to-Silver Glue job; masked tokens are consistent across loads |

### 4.3 Business Rule Application

- Business rules (e.g., allocation keys, segment mapping, intercompany elimination flags) must be externalised into the `dim.business_rules` table in Redshift, not embedded in Glue code.
- Business rule changes are owned by the Data Steward; implemented via Redshift table update with change record; no Glue code deployment required.

---

## 5. Orchestration Standards (Amazon MWAA / Airflow)

### 5.1 DAG Design

- One DAG per pipeline; do not combine unrelated pipelines into a single DAG.
- DAG naming: `{domain}_{source-system}_{entity}_{frequency}` — e.g. `finance_oracle_gl_journal_lines_daily`
- All DAGs stored in `s3://cdh-{env}-airflow-dags/` and version-controlled in Finance Architecture GitLab.
- DAG parameters: environment, bucket names, KMS keys passed via Airflow Variables or AWS Secrets Manager; never hardcoded.
- Task granularity: one task per logical step (ingest, validate, transform, load, reconcile); tasks should be idempotent and re-runnable.

### 5.2 Dependency Management

- Inter-DAG dependencies: use Airflow sensors (S3KeySensor, ExternalTaskSensor) to declare dependencies; never rely on timing alone.
- Financial close sequence: DAG dependencies must enforce: Oracle GL extract → Bronze landing → Silver quality gate → Gold load → reconciliation. No step may proceed until the prior step's sensor clears.
- SLA monitoring: every production DAG has an SLA defined (e.g., `sla=timedelta(hours=2)`); SLA miss triggers P2 alert to `finance-arch-alerts` SNS.

### 5.3 Failure Handling

- Retries: all tasks set `retries=3, retry_delay=timedelta(minutes=5)` as a minimum.
- On failure: DAG sends failure notification to `finance-arch-alerts` SNS → PagerDuty (P1 for tier_1 pipelines).
- Manual re-runs: any task may be individually re-run from the MWAA UI; idempotency ensures safe re-runs.
- Backfill: supported for batch pipelines; streaming pipelines do not support backfill (use Bronze S3 replay from MSK S3 sink).

---

## 6. Schema Management

### 6.1 Glue Data Catalog

- Every Bronze and Silver S3 dataset must have a Glue Catalog table with full column definitions, data types, and partition keys.
- Catalog updates are performed by the pipeline owner; no manual catalog edits allowed in production.
- Schema changes follow a versioning process (see below).

### 6.2 Schema Versioning

| Change Type | Classification | Process |
|-------------|---------------|---------|
| Add new optional column | Non-breaking | Update Glue Catalog; notify downstream consumers; no consumer change required |
| Rename column | Breaking | New schema version; deprecate old column with 30-day migration window |
| Remove column | Breaking | New schema version; 60-day migration window; downstream consumers must migrate before removal |
| Change data type (widening) | Non-breaking | Update Glue Catalog; no downstream impact |
| Change data type (narrowing) | Breaking | New schema version; test all consumers |
| Add new partition key | Breaking | New schema version; full reload of Silver partition |

### 6.3 MSK Schema Registry

- All MSK topics for financial events must register an Avro schema in AWS Glue Schema Registry before the first message is published.
- Schema evolution: only backwards-compatible changes (new optional fields) are allowed on a live topic; breaking changes require a new topic version.
- Schema registry enforced at consumer: consumers reject messages that fail schema validation and route to `.dlq`.

---

## 7. Data Quality Framework

### 7.1 Quality Checks

Every Silver pipeline must execute a quality check suite before promoting data to Gold:

| Check | Type | Threshold | On Failure |
|-------|------|-----------|-----------|
| Row count reconciliation | Completeness | Within ±1% of control total | Block Gold load; raise P1 alert |
| Financial amount reconciliation | Accuracy | Within ±0.01% of source system total | Block Gold load; raise P1 alert |
| Null rate on mandatory fields | Completeness | ≤ 1% null | Block Gold load if > 1%; warn if 0.1–1% |
| Referential integrity (entity, CoA) | Validity | 100% valid | Block Gold load; write orphans to error table |
| Duplicate natural key check | Uniqueness | 0 duplicates | Block Gold load; log and alert |
| SLA timeliness check | Timeliness | Data available by agreed window | P2 alert if SLA missed; P1 if > 2x SLA |
| Schema conformance | Validity | 100% conformance to catalog schema | Block Bronze-to-Silver promotion |

### 7.2 Quality Metrics Publication

- Every pipeline run publishes a quality metrics record to the `cdh.pipeline.quality` MSK topic.
- Metrics land in Redshift `cdh.pipeline_quality_runs` table.
- Power BI pipeline health dashboard reads this table to surface quality trends to Finance Architecture.

### 7.3 Data Quality Incidents

- Quality check failures that block a Gold load automatically open a Data Quality Incident in the incident management system (ServiceNow).
- P1 incidents (regulatory reporting or GL reconciliation break) are escalated to Finance Architecture on-call within 15 minutes.
- Incidents must be resolved within SLA (P1: 4 hours; P2: 1 business day) before the blocked pipeline can be re-run.

---

## 8. Pipeline Security Standards

| Concern | Standard |
|---------|---------|
| S3 access | IAM roles per pipeline; no wildcard resource grants; bucket policies block public access |
| Redshift access | IAM role for Glue-to-Redshift (COPY command); no username/password credentials for pipeline access |
| MSK access | IAM-based authentication for producers and consumers; no SASL/PLAIN credentials |
| Secrets | AWS Secrets Manager for any remaining credentials; Glue job reads secrets via IAM role at runtime |
| Encryption in transit | All S3 / MSK / Redshift traffic over TLS 1.3; Glue jobs use AWS SDK with TLS endpoints only |
| Audit | All Glue job runs logged to CloudWatch Logs with pipeline-id and run-id; S3 access logged via CloudTrail |
| Non-production | Production S3 buckets have no cross-account access to non-prod; non-prod uses synthetic or masked data |

---

## 9. Pipeline Lifecycle

### 9.1 Promotion Gates

```
Development (dev env)
  → Code review (Finance Architecture peer)
  → SIT environment: functional test + data quality suite pass
  → UAT environment: business sign-off from Data Steward + Finance Controller (for tier_1 data)
  → Production: deployment via CI/CD (GitLab pipeline); no manual production deployments
```

### 9.2 Pipeline Versioning

- Glue job scripts are version-controlled in Finance Architecture GitLab under `/cdh-pipelines/{domain}/{pipeline-name}/`.
- Semantic versioning: `{major}.{minor}.{patch}` — major increment for schema-breaking changes.
- The deployed version tag is logged in every pipeline run record and in the Glue Catalog table's pipeline version property.

### 9.3 Deprecation

- A pipeline to be decommissioned must remain in maintenance mode for a minimum of 30 days to allow downstream consumers to migrate.
- Decommission notice must be published to all registered consumer teams via the Finance Architecture data catalogue entry.
- After consumer migration confirmed, pipeline is disabled (not deleted) for 90 days before final removal.

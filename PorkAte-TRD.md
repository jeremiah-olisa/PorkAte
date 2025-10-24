# Technical Requirements Document: PorkAte Wallet Package

**Version:** 1.0  
**Date:** October 23, 2025  
**Package Name:** PorkAte  
**Author:** Jeremiah Olisa  
**Type:** Open Source Package

---

## 1. Introduction

This TRD defines the technical implementation details for the PorkAte wallet package, translating functional requirements into concrete architecture, technology choices, data models, interfaces, and integration strategies. It is intended for developers and architects responsible for building, maintaining, and extending the package.

---

## 2. Architecture Overview

- **Monorepo Structure:** Organized by adapters, core, examples, and documentation.
- **Adapter Pattern:** All external dependencies (DB, cache, events, payment, etc.) are abstracted via interfaces and pluggable adapters.
- **Provider Agnostic:** No hard dependencies on any third-party service; all integrations are via adapters.
- **TypeScript:** All code is written in TypeScript for type safety and maintainability.
- **Async Operations:** All public APIs return Promises; async/await is used throughout.
- **Configuration-Driven:** Initialization via a comprehensive config object; supports environment overrides.

---

## 2.1. ZenStack Integration

PorkAte leverages ZenStack as the schema definition and data access layer, providing significant advantages:

- **Enhanced Schema Definition:** ZModel syntax extends Prisma schema with:
  - Declarative access control policies using `@@allow` and `@@deny` rules
  - Field-level validation rules
  - Custom attributes for domain logic
  - Polymorphic relations support

- **Built-in Authorization:** Access control policies are enforced automatically:
  - No need for manual permission checks in application code
  - Policies are co-located with data models for better maintainability
  - Context-aware rules based on user authentication and roles
  - Compile-time type safety for authorization logic

- **Developer Experience:**
  - Single source of truth for data models and access control
  - Automatic generation of type-safe client with authorization
  - Reduced boilerplate code for security checks
  - Better testability with policy-aware mocks

- **Compatibility:** ZenStack is fully compatible with Prisma:
  - Generates standard Prisma schema and client
  - Works with existing Prisma migrations
  - Supports all Prisma-compatible databases
  - Can be adopted incrementally in existing Prisma projects

---

## 3. Technology Stack

- **Language:** TypeScript (Node.js >= 18)
- **Schema & ORM:** ZenStack ZModel (built on Prisma, PostgreSQL recommended, supports MySQL, SQLite, SQL Server, CockroachDB)
  - Provides enhanced schema definition with access control policies
  - Generates type-safe Prisma client with built-in authorization
- **NoSQL:** Cassandra (reference), MongoDB, DynamoDB, or custom via adapter
- **Cache:** Redis (reference), In-Memory, Memcached, or custom via adapter
- **Event System:** RabbitMQ (reference), Kafka, SNS/SQQ, Service Bus, In-Memory
- **Payment Gateways:** Paystack, Flutterwave, Stripe (reference implementations)
- **Testing:** Jest (unit/integration), custom mocks for adapters
- **Containerization:** Docker, Docker Compose, Kubernetes manifests
- **Observability:** Prometheus metrics, OpenTelemetry tracing

---

## 4. Core Modules & Interfaces

### 4.1. Configuration
- `PorkAteConfig` interface defines all configuration options (see FRD section 8).
- Validation at startup; errors are thrown for misconfigurations.
- Environment variable support via dotenv.

### 4.2. Adapters
- **Database Adapter:** ZenStack enhanced client with Prisma, ZModel schema files, migrations.
  - Access control policies defined directly in ZModel schema
  - Automatic policy enforcement at data access layer
  - Type-safe client generation with authorization built-in
- **NoSQL Adapter:** Interface for transaction storage; Cassandra reference implementation.
- **Cache Adapter:** Interface for caching; Redis reference implementation.
- **Event Adapter:** Interface for event publishing/subscription; RabbitMQ reference implementation.
- **Payment Gateway Adapter:** Interface for payment operations; Paystack/Flutterwave/Stripe reference implementations.
- **Notification Adapter:** Interface for SMS/Email/Push; pluggable.
- **Storage Adapter:** Interface for KYC document storage; S3, Azure Blob, local filesystem.

### 4.3. Core Classes
- `PorkAte`: Main entry point; exposes wallet, KYC, transaction, lien, event, and utility modules.
- `WalletManager`: Handles wallet CRUD, status, integrity checks.
- `KYCManager`: Handles KYC profiles, tier evaluation, document management.
- `TransactionManager`: Handles debit/credit, transfers, ledger, idempotency, reversal.
- `LienManager`: Handles lien placement, release, expiry.
- `EventManager`: Handles event emission and subscription.
- `AuthManager`: Handles API key and user-level authentication.

---

## 5. Data Models

All data models are defined using ZenStack ZModel syntax, which extends Prisma schema with access control policies and additional features.

- **Wallet:**
  - Fields: id (UUID), accountNumber, phoneNumber, type, status, balance, currency, kycTier, hash, timestamps
  - Access policies: Application-level authentication, wallet ownership validation
- **KYC Profile:**
  - Fields: id, walletId, profileType, tier, data (JSON), status, documents, timestamps
  - Access policies: Wallet ownership, tier-based permissions
- **Transaction:**
  - Fields: id (UUID), reference, type, sourceWalletId, destinationWalletId, amount, currency, fees, status, narration, metadata, idempotencyKey, hash, timestamps
  - Access policies: Transaction participant validation, status-based operations
- **Lien:**
  - Fields: id (UUID), walletId, amount, reason, status, expiry, reference, timestamps
  - Access policies: Wallet ownership, admin authorization
- **Ledger Entry:**
  - Fields: id, walletId, type (debit/credit), amount, previousBalance, currentBalance, transactionReference, timestamps
  - Access policies: Read-only after creation (immutable), wallet ownership
- **Event:**
  - Fields: id (UUID), type, timestamp, source, data, metadata
  - Access policies: System-level access, event subscription permissions

---

## 6. Security

- **Access Control:** ZenStack provides declarative access control policies defined in ZModel schema
  - Fine-grained authorization rules at model and field level
  - Context-aware policies based on user roles and ownership
  - Automatic enforcement at data access layer
- **Encryption:** AES-256-GCM for data at rest; TLS 1.3+ for data in transit.
- **Hashing:** bcrypt/argon2 for PINs; SHA-256/SHA-512 for integrity.
- **API Keys:** Public/Secret key pairs; rotation and expiration supported.
- **Rate Limiting:** Configurable per API key; implemented via cache adapter.
- **Input Validation:** All inputs validated using class-validator or custom logic; ZModel provides schema-level validation.
- **Audit Logging:** Immutable logs; stored in append-only format.

---

## 7. Transaction Processing

- **Double-Entry Ledger:** Enforced via database schema and business logic.
- **Processing Models:**
  - Model A: Real-time balance update (row-level locking)
  - Model B: Deferred update (ledger reconciliation, incremental caching)
- **Idempotency:** Enforced via cache adapter; idempotency keys expire after configurable TTL.
- **Concurrency Control:**
  - Pessimistic locking for Model A
  - Optimistic/eventual consistency for Model B
- **Fee Calculation:** Configurable; handled as separate ledger entries.

---

## 8. KYC & Tier Management

- **Profile Types:** Individual, Group, Corporate; enforced via schema and validation.
- **Tier Structure:** Configurable; limits enforced before transactions.
- **Document Storage:** Encrypted; time-limited access URLs via storage adapter.
- **Verification Workflow:** Status transitions emit events; tier upgrades require verification.

---

## 9. API & SDK Design

- **Library Usage:** Main entry is `PorkAte` class/factory; all methods async.
- **RESTful Endpoints:** Optional; utilities provided for Express/NestJS integration.
- **Error Handling:** Custom error classes; error codes/messages/context/stack trace.
- **Type Definitions:** Comprehensive TypeScript types for all public APIs.

---

## 10. Testing & Quality Assurance

- **Unit Tests:** Jest; >80% coverage required for core modules.
- **Integration Tests:** Adapter implementations, migrations, end-to-end flows.
- **Performance Tests:** Load/stress/concurrency scenarios; 1,000 TPS target.
- **Security Tests:** Penetration, injection, authentication bypass.

---

## 11. Deployment & Operations

- **Docker:** Dockerfile and Compose for local/prod deployments.
- **Kubernetes:** Helm charts for scalable deployments.
- **Environment Variables:** All secrets/configs externalized; `.env.example` provided.
- **Migrations:** ZenStack generates Prisma migrations from ZModel schema; rollback supported.
  - `zenstack generate` command creates Prisma schema and client
  - Standard Prisma migration workflow applies
- **Monitoring:** Prometheus metrics endpoint; health checks for orchestration.

---

## 12. Documentation & Community

- **Docs:** Getting started, API reference, architecture, integration, operations.
- **Contribution:** Guidelines, code of conduct, PR templates.
- **Support:** GitHub issues, Discord/Slack, Stack Overflow.
- **License:** MIT

---

## 13. Roadmap & Future Enhancements

- **Phase 1:** Core wallet, basic KYC, transfers, balance, history, events
- **Phase 2:** Multi-tier KYC, liens, reversal, NoSQL, payment gateways, QR/phone transfers
- **Phase 3:** Card services, multi-currency, FX, analytics, compliance, bulk ops, webhooks
- **Phase 4:** Savings, loans, scheduled/recurring payments, smart contracts, crypto, AI fraud detection

---

## 14. Diagrams & Schemas

- **System Architecture Diagram:** [To be provided]
- **Database Schema:** [ZenStack ZModel schema files in repo (`schema.zmodel`)]
  - ZModel extends Prisma schema with access control and validation
  - Generates Prisma client with built-in authorization
  - Policy enforcement at data layer ensures security by default
- **Adapter Interfaces:** [TypeScript interfaces in `porkate/interfaces`]

---

## 15. Approval & Review

- [ ] Technical Review
- [ ] Security Review
- [ ] Compliance Review
- [ ] Community Feedback
- [ ] Final Approval

---

**End of Technical Requirements Document**

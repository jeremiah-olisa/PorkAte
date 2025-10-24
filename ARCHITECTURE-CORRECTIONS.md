# PorkAte Architecture Corrections

**Date:** October 24, 2025  
**Version:** 2.0 (Corrected)

---

## Critical Corrections Made

### 1. TownKrier - From Event Bus to Notification System

**❌ INCORRECT (Previous):**
- TownKrier was described as an "event system for distributed applications"
- Focused on pub/sub messaging, event propagation, cache invalidation
- Similar to RabbitMQ/Kafka abstractions

**✅ CORRECT (Now):**
- TownKrier is a **Laravel-style notification system**
- Multi-channel notification delivery (Email, SMS, Push, In-App, Database, Slack)
- Provider-agnostic (Resend, Twilio, Firebase, OneSignal, etc.)
- Elegant notification classes API like Laravel
- Queue support for async notification delivery

**Reference:** See `.docs/product/townkrier/TownKrier-FRD.md` - "Laravel-style notification capabilities"

### 2. EventBus - New Package for Cache Invalidation

**What was missing:**
- Invalid8 needs an event system for distributed cache invalidation
- This is NOT the same as a notification system

**✅ ADDED:**
- New package: `@eventbus/core`
- Purpose: Event bus for cache invalidation and internal events
- Used by Invalid8 for distributed cache synchronization
- Supports RabbitMQ, Kafka, Memory adapters
- Lightweight pub/sub for application events

### 3. Payment Gateway Adapters - Missing Packages

**❌ MISSING (Previous):**
- No payment gateway packages were included
- Only mentioned in FRD as abstract concept

**✅ ADDED (Now):**
- `@porkate/payment` - Core payment gateway interface (extraction-ready)
- `@porkate/paystack` - Paystack adapter (extraction-ready)
- `@porkate/stripe` - Stripe adapter (extraction-ready)
- `@porkate/flutterwave` - Flutterwave adapter (extraction-ready)

**Reference:** PorkAte-FRD.md Section 4.11 - "Payment Gateway Integration"

### 4. Kolo - Clarified Purpose

**What was unclear:**
- Kolo's specific use case wasn't well documented

**✅ CLARIFIED:**
- Primary purpose: KYC document storage
- Supports S3, Azure Blob, Local filesystem
- Encrypted storage with time-limited access URLs
- "Kolo" means "piggybank" or "secure box" in Yoruba

---

## Updated Package Dependency Graph

```
@porkate/core (Main Wallet Package)
  │
  ├── @invalid8/core (Caching - React Query-inspired)
  │   └── @eventbus/core (Events for cache invalidation)
  │
  ├── @townkrier/core (Notifications - Laravel-style)
  │   ├── Email Channel → Resend, SendGrid, Nodemailer
  │   ├── SMS Channel → Twilio, Termii
  │   ├── Push Channel → Firebase (FCM), OneSignal
  │   ├── Database Channel → Store in-app notifications
  │   └── Slack Channel → Team notifications
  │
  ├── @kolo/core (Storage - KYC Documents)
  │   ├── S3 Adapter → AWS S3
  │   ├── Azure Adapter → Azure Blob Storage
  │   └── Local Adapter → Filesystem
  │
  └── @porkate/payment (Payment Gateway Interface)
      ├── @porkate/paystack (Paystack Integration)
      ├── @porkate/stripe (Stripe Integration)
      └── @porkate/flutterwave (Flutterwave Integration)
```

---

## Package Purposes - Clear Definitions

| Package | Purpose | Used For | Extraction-Ready |
|---------|---------|----------|------------------|
| `@porkate/core` | Wallet operations | Main package - wallet, KYC, transactions, ledger | ❌ Core (non-extractable) |
| `@porkate/nosql` | NoSQL adapters | Transaction storage (Cassandra, MongoDB) | ❌ Internal only |
| `@invalid8/core` | Caching library | React Query-like cache with CQRS optimization | ✅ Yes |
| `@eventbus/core` | Event bus | Cache invalidation, distributed events | ✅ Yes |
| `@townkrier/core` | Notifications | Multi-channel notifications (email, SMS, push, in-app) | ✅ Yes |
| `@kolo/core` | Document storage | KYC document storage with encryption | ✅ Yes |
| `@porkate/payment` | Payment interface | Payment gateway abstraction | ✅ Yes |
| `@porkate/paystack` | Paystack adapter | Nigerian payment processing | ✅ Yes |
| `@porkate/stripe` | Stripe adapter | International payment processing | ✅ Yes |
| `@porkate/flutterwave` | Flutterwave adapter | Pan-African payment processing | ✅ Yes |

---

## Use Case Examples

### Scenario 1: User Registration Flow
```typescript
// 1. User registers via Auth0 (external auth - NOT part of PorkAte)
const user = await auth0.createUser({ email, password });

// 2. Create wallet in PorkAte
const wallet = await walletService.createWallet({
  userId: user.id,
  phoneNumber: user.phone,
  accountType: 'INDIVIDUAL'
});

// 3. Send welcome notification via TownKrier
await user.notify(new WelcomeNotification(wallet));
// TownKrier sends via Email (Resend) + SMS (Twilio) + In-App (Database)
```

### Scenario 2: Wallet Funding
```typescript
// 1. Initialize payment via Paystack
const payment = await paystackGateway.initializePayment({
  email: user.email,
  amount: 10000,
  reference: generateRef()
});

// 2. User pays on Paystack hosted page

// 3. Webhook received from Paystack
await paystackGateway.verifyPayment(reference);

// 4. Credit wallet
await walletService.creditWallet(walletId, amount);

// 5. Invalidate cache (via EventBus)
await eventBus.emit('wallet.updated', { walletId });
// Invalid8 listens to this event and invalidates cache

// 6. Send notification (via TownKrier)
await user.notify(new WalletCreditedNotification(amount));
```

### Scenario 3: KYC Document Upload
```typescript
// 1. Upload document to Kolo
const documentKey = await kolo.upload({
  file: userIdCard,
  bucket: 'kyc-documents',
  encrypt: true
});

// 2. Store reference in KYC record
await kycService.updateKYC(walletId, {
  documents: {
    idCard: documentKey  // Kolo storage key
  }
});

// 3. Send notification
await user.notify(new KYCDocumentReceivedNotification());
```

---

## Migration from Old Setup Script

If you already ran the old `porkate-monorepo-setup.sh`, here's how to migrate:

### Option 1: Clean Start (Recommended)
```bash
# Backup any custom code
cp -r packages/core/src /tmp/backup-core-src

# Remove old structure
rm -rf packages/ standalone-packages/ node_modules/

# Run new setup script
bash porkate-monorepo-setup-v2.sh
```

### Option 2: Manual Migration
```bash
# 1. Rename TownKrier to EventBus
mv standalone-packages/townkrier standalone-packages/eventbus
# Update package.json name to @eventbus/core

# 2. Create new TownKrier (notification system)
mkdir -p standalone-packages/townkrier/src/{core,channels,adapters}
# Create package.json with notification system structure

# 3. Add payment packages
mkdir -p standalone-packages/{payment,paystack,stripe,flutterwave}
# Create package.json for each

# 4. Update dependencies in @porkate/core
# Add: @eventbus/core, @townkrier/core, @porkate/payment

# 5. Update lerna.json and pnpm-workspace.yaml
# (Already correct if you followed original setup)
```

---

## File Changes Summary

### New Files Created
- `porkate-monorepo-setup-v2.sh` - Corrected setup script
- `ARCHITECTURE-CORRECTIONS.md` - This document

### Files to Update (Next Steps)
- `.docs/product/PorkAte-FRD.md` - Update adapter section with correct package names
- `.docs/product/PorkAte-TRD.md` - Add payment adapter technical specs
- `.docs/product/PorkAte-TODO.md` - Update with payment and notification tasks
- `docs/architecture/MONOREPO-STRUCTURE.md` - Update with corrected architecture
- `docs/migration/PACKAGE-MIGRATION-GUIDE.md` - Add payment packages to extraction guide
- `IMPLEMENTATION-SUMMARY.md` - Update with corrections

### New Documentation Needed
- `docs/packages/eventbus/README.md` - EventBus documentation
- `docs/packages/townkrier/README.md` - TownKrier (notifications) documentation
- `docs/packages/payment/README.md` - Payment interface documentation
- `standalone-packages/paystack/README.md` - Paystack adapter guide
- `standalone-packages/stripe/README.md` - Stripe adapter guide
- `standalone-packages/flutterwave/README.md` - Flutterwave adapter guide

---

## Key Takeaways

1. **TownKrier = Notifications** (like Laravel Notifications), NOT events
2. **EventBus = Events** (for cache invalidation and internal events)
3. **Payment adapters** are now first-class standalone packages
4. **Kolo** is specifically for KYC document storage
5. **All standalone packages** are extraction-ready from day one

---

## Next Actions

1. ✅ Run the corrected setup script: `bash porkate-monorepo-setup-v2.sh`
2. ✅ Update documentation files (FRD, TRD, TODO)
3. ✅ Create detailed README files for each standalone package
4. ✅ Update MONOREPO-STRUCTURE.md with correct dependency graph
5. ✅ Implement core functionality for each package
6. ✅ Write comprehensive tests

---

**Questions or Issues?**

Review the TownKrier FRD: `.docs/product/townkrier/TownKrier-FRD.md`  
Review the PorkAte FRD: `.docs/product/PorkAte-FRD.md` (Section 4.11 - Payment Gateway Integration)

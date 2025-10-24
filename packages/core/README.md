# @porkate/core

Core wallet operations package with multi-provider database support via ZenStack.

## Features

- 🏦 Double-Entry Ledger
- 🔐 Transaction Authorization (PIN-based)
- 📊 KYC Management (CBN-compliant)
- 🔄 Transaction Management
- 🔒 Lien Management
- 🗄️ Multi-Database Support (PostgreSQL, MySQL, SQLite, SQL Server, CockroachDB)
- 💳 Payment Gateway Integration (Paystack, Stripe, Flutterwave)
- 📧 Notification System (TownKrier)
- 📦 Document Storage (Kolo)
- ⚡ Caching (Invalid8)

## Installation

```bash
npm install @porkate/core @invalid8/core @eventbus/core @townkrier/core @kolo/core @porkate/payment
# Install payment providers as needed
npm install @porkate/paystack @porkate/stripe @porkate/flutterwave
```

## Documentation

See [full documentation](../../docs/product/PorkAte-FRD.md).

## License

MIT

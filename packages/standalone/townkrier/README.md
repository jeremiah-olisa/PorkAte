# TownKrier

Laravel-style notification system for Node.js - send notifications across multiple channels with a unified API.

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Features

- 📧 **Multi-Channel Support:** Email, SMS, Push, In-App, Slack, Database
- 🎯 **Provider Agnostic:** Works with Resend, Twilio, Firebase, OneSignal, and more
- 🚀 **Laravel-inspired API:** Familiar and elegant notification classes
- ⚡ **Queue Support:** Async notification delivery
- 🛡️ **Type-Safe:** Full TypeScript support
- 🔌 **Framework Agnostic:** Works with Express, NestJS, or standalone

## Installation

```bash
npm install @townkrier/core
# Install channel providers as needed
npm install resend twilio firebase-admin onesignal-node
```

## Quick Start

```typescript
import { Notification, MailChannel, SmsChannel } from '@townkrier/core';

// Define a notification
class OrderShipped extends Notification {
  constructor(private order: Order) {
    super();
  }

  via(notifiable: Notifiable): string[] {
    return ['mail', 'sms', 'database'];
  }

  toMail(notifiable: Notifiable): MailMessage {
    return new MailMessage()
      .subject('Order Shipped!')
      .line(`Your order #${this.order.id} has been shipped.`)
      .action('Track Order', this.order.trackingUrl);
  }

  toSms(notifiable: Notifiable): SmsMessage {
    return new SmsMessage()
      .content(`Your order #${this.order.id} has shipped!`);
  }
}

// Send notification
await user.notify(new OrderShipped(order));
```

## Channels

- **Mail:** Resend, SendGrid, Nodemailer, custom SMTP
- **SMS:** Twilio, Termii, custom providers
- **Push:** Firebase (FCM), OneSignal, custom providers
- **In-App/Database:** Store notifications in database
- **Slack:** Send to Slack channels
- **Custom:** Create your own channels

## Documentation

See [full documentation](../../docs/packages/townkrier/README.md).

## Extraction Guide

This package is designed to be extracted to a separate repository. See [PACKAGE-MIGRATION-GUIDE.md](../../docs/migration/PACKAGE-MIGRATION-GUIDE.md).

## License

MIT

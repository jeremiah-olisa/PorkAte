# Payment Gateway Implementation Checklist

Use this checklist when implementing new payment gateway adapters.

## Prerequisites

- [ ] Sign up for gateway account (dev/test account)
- [ ] Get API credentials (secret key, public key)
- [ ] Review API documentation
- [ ] Understand API rate limits and constraints
- [ ] Test API endpoints with Postman/curl

## 1. Package Setup

- [ ] Create package directory: `packages/standalone/@porkate-payment/[gateway-name]/`
- [ ] Copy structure from Paystack package
- [ ] Update `package.json`
  - [ ] Change package name to `@porkate/[gateway-name]`
  - [ ] Add gateway-specific dependencies
  - [ ] Set correct version
- [ ] Create directory structure:
  ```
  src/
  ├── core/
  ├── interfaces/
  ├── types/
  └── utils/
  test/
  ├── unit/
  └── integration/
  docs/
  ```

## 2. Types Definition (`src/types/index.ts`)

- [ ] Define gateway config interface
  ```typescript
  interface [Gateway]Config {
    secretKey: string;
    publicKey?: string;
    baseUrl?: string;
    // Add gateway-specific fields
  }
  ```
- [ ] Define API response types
- [ ] Define transaction data types
- [ ] Define refund data types
- [ ] Map gateway-specific types

## 3. Error Handling (`src/interfaces/`)

- [ ] Create base error class: `[Gateway]Error`
- [ ] Create API error class: `[Gateway]ApiError`
- [ ] Create config error class: `[Gateway]ConfigError`
- [ ] Add error codes enum (optional)
- [ ] Export all error types

## 4. Utilities (`src/utils/index.ts`)

- [ ] Currency mapping function
  ```typescript
  mapTo[Gateway]Currency(currency: Currency): string
  ```
- [ ] Status mapping function
  ```typescript
  map[Gateway]Status(status: string): PaymentStatus
  ```
- [ ] Channel mapping functions
- [ ] URL builder utility
- [ ] Metadata sanitization
- [ ] Request payload builders
- [ ] Response parsers

## 5. Main Gateway Implementation (`src/core/[gateway]-gateway.ts`)

### Class Setup
- [ ] Import all required types from `@porkate/payment`
- [ ] Import gateway-specific types
- [ ] Create main gateway class implementing `IPaymentGateway`
- [ ] Set up HTTP client (axios, fetch, etc.)
- [ ] Initialize configuration
- [ ] Add request/response interceptors (for debug mode)

### Methods Implementation

#### Constructor
- [ ] Validate configuration
- [ ] Initialize HTTP client
- [ ] Set up base URL
- [ ] Configure timeout
- [ ] Add authentication headers

#### initiatePayment()
- [ ] Validate request parameters
- [ ] Generate reference if not provided
- [ ] Map currency to gateway format
- [ ] Map channels to gateway format
- [ ] Sanitize metadata
- [ ] Build API request payload
- [ ] Make API call to initialize endpoint
- [ ] Handle API response
- [ ] Map response to `InitiatePaymentResponse`
- [ ] Handle errors properly

#### verifyPayment()
- [ ] Validate reference parameter
- [ ] Make API call to verify endpoint
- [ ] Parse transaction data
- [ ] Map status to standard format
- [ ] Map response to `VerifyPaymentResponse`
- [ ] Handle errors properly

#### getPayment()
- [ ] Validate reference parameter
- [ ] Make API call to get transaction endpoint
- [ ] Parse transaction data
- [ ] Map authorization details (if available)
- [ ] Map response to `GetPaymentResponse`
- [ ] Handle errors properly

#### refundPayment()
- [ ] Validate request parameters
- [ ] Build refund payload
- [ ] Handle partial vs full refund
- [ ] Make API call to refund endpoint
- [ ] Parse refund response
- [ ] Map response to `RefundPaymentResponse`
- [ ] Handle errors properly

#### cancelPayment() (optional)
- [ ] Check if gateway supports cancellation
- [ ] Implement cancel logic or status check
- [ ] Map response to `CancelPaymentResponse`
- [ ] Handle errors properly

#### Helper Methods
- [ ] `getGatewayName()` - Return gateway name
- [ ] `isReady()` - Check configuration
- [ ] `mapChannel()` - Map payment channels
- [ ] `handleError()` - Centralized error handling

## 6. Export Configuration (`src/index.ts`)

- [ ] Export main gateway class
- [ ] Export types
- [ ] Export interfaces
- [ ] Export utilities
- [ ] Export error classes

## 7. Documentation

### Package README (`README.md`)
- [ ] Package description
- [ ] Installation instructions
- [ ] Supported operations list
- [ ] Quick start example
- [ ] Configuration options
- [ ] Usage examples for all operations
- [ ] Error handling examples
- [ ] Supported channels list
- [ ] Supported currencies list
- [ ] Test credentials/cards
- [ ] Best practices
- [ ] API reference
- [ ] Links to gateway docs

### Code Documentation
- [ ] JSDoc comments on all public methods
- [ ] Parameter descriptions
- [ ] Return type descriptions
- [ ] Usage examples in comments
- [ ] Note any limitations

## 8. Testing

### Unit Tests (`test/unit/`)
- [ ] Configuration tests
  - [ ] Valid config initialization
  - [ ] Invalid config error handling
- [ ] Gateway name and ready status
- [ ] Utility functions
  - [ ] Currency mapping
  - [ ] Status mapping
  - [ ] Channel mapping
- [ ] Error classes

### Integration Tests (`test/integration/`)
- [ ] Mock API responses
- [ ] Test initiatePayment with mocked API
- [ ] Test verifyPayment with mocked API
- [ ] Test getPayment with mocked API
- [ ] Test refundPayment with mocked API
- [ ] Test error scenarios
- [ ] Test timeout handling
- [ ] Test rate limiting (if applicable)

### E2E Tests (optional)
- [ ] Test with real API in sandbox mode
- [ ] Full payment flow
- [ ] Refund flow

## 9. Examples

### Basic Example (`examples/payment/src/[gateway]-example.ts`)
- [ ] Initialize gateway
- [ ] Initiate payment example
- [ ] Verify payment example
- [ ] Get payment example
- [ ] Refund payment example
- [ ] Complete flow example
- [ ] Error handling example

### Framework Examples
- [ ] Express.js integration (optional)
- [ ] NestJS integration (optional)

## 10. Additional Features (Optional)

- [ ] Webhook support
  - [ ] Signature verification
  - [ ] Event handlers
  - [ ] Types for webhook events
- [ ] Retry logic
  - [ ] Exponential backoff
  - [ ] Max retries configuration
- [ ] Caching
  - [ ] Payment status caching
  - [ ] TTL configuration
- [ ] Logging
  - [ ] Structured logging
  - [ ] Transaction tracking
- [ ] Advanced features (if supported)
  - [ ] Subscription payments
  - [ ] Split payments
  - [ ] Payment plans
  - [ ] Bulk operations

## 11. Quality Checks

- [ ] All TypeScript types are properly defined
- [ ] No `any` types without good reason
- [ ] All methods have proper error handling
- [ ] All public APIs are documented
- [ ] Tests pass with good coverage
- [ ] No linting errors
- [ ] README is complete and accurate
- [ ] Examples run successfully
- [ ] Package builds without errors

## 12. Gateway-Specific Checklist

### Flutterwave
- [ ] Support for rave_ref and flw_ref
- [ ] Handle multiple webhook events
- [ ] Support for multiple currencies (NGN, USD, GHS, etc.)
- [ ] Payment link generation
- [ ] Card tokenization
- [ ] Transfer recipient management

### Stripe
- [ ] Support for Payment Intents
- [ ] Support for Checkout Sessions
- [ ] Webhook signing verification
- [ ] Support for multiple currencies
- [ ] Card setup and payment methods
- [ ] Customer management
- [ ] Subscription support

### Add your gateway checklist here
- [ ] ...

## 13. Final Steps

- [ ] Build package: `pnpm build`
- [ ] Run tests: `pnpm test`
- [ ] Check for type errors
- [ ] Verify examples work
- [ ] Test in actual project
- [ ] Code review
- [ ] Update main documentation
- [ ] Add to workspace packages
- [ ] Publish (when ready)

## Resources

- Core package: `packages/standalone/@porkate-payment/core/`
- Paystack reference: `packages/standalone/@porkate-payment/paystack/`
- Implementation guide: `docs/packages/payment/IMPLEMENTATION.md`
- Quick start: `docs/packages/payment/QUICK-START.md`

---

**Pro Tips:**
- Follow the Paystack implementation as a reference
- Use the same error handling patterns
- Keep the same code style and structure
- Test thoroughly with sandbox/test credentials
- Document any gateway-specific limitations
- Add proper TypeScript types for everything
- Use meaningful error messages

**Common Pitfalls:**
- Not handling errors properly
- Forgetting to map gateway statuses to standard statuses
- Not validating configuration
- Missing timeout handling
- Not sanitizing metadata
- Hardcoding values instead of using config
- Not testing edge cases

Good luck! 🚀

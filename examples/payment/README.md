# Payment Gateway Examples

This folder contains examples for using the `@porkate/payment` packages.

## Examples

### Paystack Example

See `src/paystack-example.ts` for a complete example of using the Paystack gateway.

**To run:**

```bash
# Set your API keys
export PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
export PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Run the example
pnpm paystack
```

## What's Included

The example demonstrates:

1. **Initializing the Gateway** - How to configure and initialize the Paystack gateway
2. **Initiating Payments** - Creating a new payment transaction
3. **Verifying Payments** - Checking payment status after completion
4. **Getting Payment Details** - Retrieving full payment information
5. **Refunding Payments** - Processing refunds (full and partial)
6. **Error Handling** - Properly handling errors and edge cases
7. **Complete Flow** - End-to-end payment workflow

## Configuration

Create a `.env` file in this directory:

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
```

## Test Cards

Use these test cards with Paystack:

- **Successful Payment**: 4084084084084081
- **Insufficient Funds**: 5060666666666666666
- **Declined**: 5061004410004

## Notes

- The examples use test keys and test mode
- Always verify payments on your backend
- Store payment references for reconciliation
- Use webhooks for real-time payment updates

## Resources

- [Paystack Documentation](https://paystack.com/docs/)
- [@porkate/payment Core Documentation](../../packages/standalone/@porkate-payment/core/README.md)
- [@porkate/paystack Documentation](../../packages/standalone/@porkate-payment/paystack/README.md)

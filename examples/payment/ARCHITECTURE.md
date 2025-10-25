# @porkate/payment - Architecture & Flow Diagrams

Visual guides to understand the payment flow and architecture.

## 📐 Single Gateway Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Application                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌─────────────────────┐          │
│  │   Express    │         │      NestJS         │          │
│  │     API      │   OR    │    Application      │          │
│  └──────┬───────┘         └──────────┬──────────┘          │
│         │                             │                      │
│         └─────────────┬───────────────┘                      │
│                       │                                      │
│           ┌───────────▼──────────────┐                      │
│           │ PaymentGatewayManager    │                      │
│           │  - Single Gateway        │                      │
│           │  - Paystack Adapter      │                      │
│           └───────────┬──────────────┘                      │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        │ API Calls
                        │
┌───────────────────────▼──────────────────────────────────────┐
│                  Paystack API                                │
│               (Payment Gateway)                               │
└──────────────────────────────────────────────────────────────┘
```

## 🔄 Multiple Gateway Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Your Application                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌─────────────────────┐              │
│  │   Express    │         │      NestJS         │              │
│  │     API      │   OR    │    Application      │              │
│  └──────┬───────┘         └──────────┬──────────┘              │
│         │                             │                          │
│         └─────────────┬───────────────┘                          │
│                       │                                          │
│           ┌───────────▼──────────────────────┐                  │
│           │   PaymentGatewayManager          │                  │
│           │   - Multiple Gateways            │                  │
│           │   - Smart Selection              │                  │
│           │   - Automatic Failover           │                  │
│           └───────────┬──────────────────────┘                  │
│                       │                                          │
│         ┌─────────────┼─────────────┐                           │
│         │             │              │                           │
│    ┌────▼─────┐  ┌───▼────┐  ┌─────▼──────┐                   │
│    │ Paystack │  │Flutter │  │   Stripe   │                   │
│    │ Adapter  │  │  wave  │  │  Adapter   │                   │
│    │Priority:100  │Priority:90  │Priority:80 │                   │
│    └────┬─────┘  └───┬────┘  └─────┬──────┘                   │
│         │            │              │                           │
└─────────┼────────────┼──────────────┼───────────────────────────┘
          │            │              │
          │ API Calls  │ API Calls    │ API Calls
          │            │              │
┌─────────▼────────────▼──────────────▼───────────────────────────┐
│             Payment Gateway Providers                            │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐         │
│  │   Paystack   │  │  Flutterwave  │  │    Stripe    │         │
│  │     API      │  │      API      │  │     API      │         │
│  └──────────────┘  └───────────────┘  └──────────────┘         │
└──────────────────────────────────────────────────────────────────┘
```

## 💳 Payment Flow - Single Gateway

```
┌─────────┐                                                      
│ Customer│                                                      
└────┬────┘                                                      
     │                                                           
     │ 1. Click "Pay Now"                                      
     │                                                           
┌────▼────────────┐                                             
│   Your App      │                                             
│  (Frontend)     │                                             
└────┬────────────┘                                             
     │                                                           
     │ 2. POST /api/payments/initiate                          
     │    { amount, email, ... }                               
     │                                                           
┌────▼────────────┐                                             
│   Your API      │                                             
│ (Backend)       │                                             
└────┬────────────┘                                             
     │                                                           
     │ 3. gateway.initiatePayment()                            
     │                                                           
┌────▼────────────┐                                             
│ PaymentGateway  │                                             
│    Manager      │                                             
└────┬────────────┘                                             
     │                                                           
     │ 4. API Request                                          
     │                                                           
┌────▼────────────┐                                             
│   Paystack      │                                             
│     API         │                                             
└────┬────────────┘                                             
     │                                                           
     │ 5. Return { authorizationUrl, reference }               
     │                                                           
┌────▼────────────┐                                             
│   Your API      │                                             
└────┬────────────┘                                             
     │                                                           
     │ 6. Return authorizationUrl                              
     │                                                           
┌────▼────────────┐                                             
│   Your App      │                                             
│  (Frontend)     │                                             
└────┬────────────┘                                             
     │                                                           
     │ 7. Redirect to authorizationUrl                         
     │                                                           
┌────▼────────────┐                                             
│   Paystack      │                                             
│ Payment Page    │                                             
└────┬────────────┘                                             
     │                                                           
     │ 8. Customer completes payment                           
     │                                                           
┌────▼────────────┐                                             
│   Paystack      │                                             
└────┬────────────┘                                             
     │                                                           
     │ 9. Redirect to callbackUrl?reference=xxx                
     │                                                           
┌────▼────────────┐                                             
│   Your App      │                                             
│  (Frontend)     │                                             
└────┬────────────┘                                             
     │                                                           
     │ 10. GET /api/payments/verify/:reference                 
     │                                                           
┌────▼────────────┐                                             
│   Your API      │                                             
└────┬────────────┘                                             
     │                                                           
     │ 11. gateway.verifyPayment()                             
     │                                                           
┌────▼────────────┐                                             
│   Paystack      │                                             
│     API         │                                             
└────┬────────────┘                                             
     │                                                           
     │ 12. Return { status: 'success', amount, ... }          
     │                                                           
┌────▼────────────┐                                             
│   Your API      │                                             
│ - Update order  │                                             
│ - Fulfill items │                                             
└────┬────────────┘                                             
     │                                                           
     │ 13. Return success response                             
     │                                                           
┌────▼────────────┐                                             
│   Your App      │                                             
│ Show success!   │                                             
└─────────────────┘                                             
```

## 🔄 Multiple Gateway Flow with Failover

```
┌─────────┐
│ Customer│
└────┬────┘
     │
     │ 1. Initiate payment (NGN 50,000)
     │
┌────▼────────────┐
│ Gateway Manager │
└────┬────────────┘
     │
     │ 2. Select gateway based on currency (NGN → Paystack)
     │
┌────▼────────────┐
│    Paystack     │
│   (Priority:100)│
└────┬────────────┘
     │
     │ 3. Try payment initiation
     │
     ├─────────────┐
     │             │
     ✓ SUCCESS     ✗ FAILED
     │             │
     │             │ 4. Automatic failover
     │             │
     │        ┌────▼────────────┐
     │        │  Flutterwave    │
     │        │  (Priority:90)  │
     │        └────┬────────────┘
     │             │
     │             │ 5. Try payment initiation
     │             │
     │             ├─────────────┐
     │             │             │
     │             ✓ SUCCESS     ✗ FAILED
     │             │             │
     │             │             │ 6. Last resort
     │             │             │
     │             │        ┌────▼────────────┐
     │             │        │     Stripe      │
     │             │        │  (Priority:80)  │
     │             │        └────┬────────────┘
     │             │             │
     │             │             ✓ SUCCESS or FAIL
     │             │             │
     └─────────────┴─────────────┘
                   │
                   │ 7. Return result
                   │
              ┌────▼────────────┐
              │    Customer     │
              │ Payment page    │
              └─────────────────┘
```

## 🎯 Gateway Selection Strategy

```
┌─────────────────────────────────────────────────────────────┐
│              Payment Request Received                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Check Currency & Amount      │
        └───────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │               │
         ▼              ▼               ▼
    ┌────────┐    ┌─────────┐    ┌─────────┐
    │  NGN   │    │ USD/EUR │    │  Other  │
    └───┬────┘    └────┬────┘    └────┬────┘
        │              │               │
        ▼              ▼               ▼
   ┌─────────┐   ┌─────────┐    ┌──────────┐
   │Paystack │   │ Stripe  │    │Flutterwave│
   └────┬────┘   └────┬────┘    └─────┬────┘
        │             │                │
        └─────────────┴────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │  Check Gateway Health  │
         └────────────────────────┘
                      │
              ┌───────┴───────┐
              │               │
              ▼               ▼
         ┌────────┐      ┌────────┐
         │Healthy │      │  Down  │
         └───┬────┘      └───┬────┘
             │               │
             │               ▼
             │     ┌──────────────────┐
             │     │ Try Next Gateway │
             │     │   (Fallback)     │
             │     └─────────┬────────┘
             │               │
             └───────────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │  Execute Payment     │
         └──────────────────────┘
```

## 📊 Data Flow - NestJS Architecture

```
┌───────────────────────────────────────────────────────────┐
│                      HTTP Request                          │
│              POST /api/payments/initiate                   │
└─────────────────────┬─────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   ValidationPipe                            │
│          (Validates InitiatePaymentDto)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                PaymentController                            │
│         @Post('initiate')                                   │
│         initiatePayment(@Body() dto)                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Injects
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 PaymentService                              │
│         - Business logic                                    │
│         - Transaction management                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Injects (via @Inject)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│           PAYMENT_GATEWAY (IPaymentGateway)                 │
│         - PaystackGateway (single)                          │
│         - GatewayManager (multiple)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ API Call
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              External Payment API                           │
│         (Paystack/Flutterwave/Stripe)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Response
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 PaymentService                              │
│         - Process response                                  │
│         - Emit events                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              PaymentController                              │
│         - Format response                                   │
│         - Handle errors                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               HTTP Response                                 │
│         { success, data, message }                          │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Webhook Flow

```
┌─────────────┐
│  Payment    │
│  Gateway    │
│ (Paystack)  │
└──────┬──────┘
       │
       │ Payment status change
       │ (success/failed)
       │
       │ POST /webhooks/payment
       │ Headers: { x-paystack-signature }
       │ Body: { event, data }
       │
┌──────▼──────────────────────┐
│     Your API Server          │
│  Webhook Endpoint Handler    │
└──────┬──────────────────────┘
       │
       │ 1. Verify signature
       │    (Security check)
       │
       ├─────────────┐
       │             │
       ✓ Valid       ✗ Invalid
       │             │
       │             └──► Return 401
       │
       │ 2. Parse event
       │
       ├─────────────┬─────────────┐
       │             │              │
   ┌───▼──────┐ ┌───▼────────┐ ┌──▼────────┐
   │  charge  │ │   charge   │ │  Other    │
   │ .success │ │  .failed   │ │  events   │
   └───┬──────┘ └───┬────────┘ └──┬────────┘
       │            │              │
       │            │              │
   ┌───▼────────────▼──────────────▼───┐
   │     Process Event                  │
   │  - Update database                 │
   │  - Fulfill order (success)         │
   │  - Notify customer                 │
   │  - Log transaction                 │
   └────────────────┬───────────────────┘
                    │
                    │ 3. Return 200 OK
                    │    (Acknowledge receipt)
                    │
           ┌────────▼─────────┐
           │  Payment Gateway  │
           │ (Mark as received)│
           └───────────────────┘
```

## 📈 Performance & Monitoring

```
┌─────────────────────────────────────────────────────────────┐
│              Payment Transaction                             │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
   ┌────▼────┐ ┌───▼────┐ ┌───▼─────┐
   │  Logs   │ │Metrics │ │ Events  │
   └────┬────┘ └───┬────┘ └───┬─────┘
        │          │           │
        ▼          ▼           ▼
   ┌─────────────────────────────────┐
   │   Monitoring & Analytics        │
   │                                 │
   │  - Success rates                │
   │  - Response times               │
   │  - Error rates                  │
   │  - Gateway health               │
   │  - Transaction volume           │
   └─────────────┬───────────────────┘
                 │
                 ▼
   ┌─────────────────────────────────┐
   │        Dashboards & Alerts      │
   │                                 │
   │  📊 Real-time metrics           │
   │  📈 Historical trends           │
   │  🚨 Alert on failures           │
   │  📧 Notifications               │
   └─────────────────────────────────┘
```

## 🎨 Key Concepts Visual Summary

```
┌──────────────────────────────────────────────────────────────┐
│                    @porkate/payment                           │
│                  Core Concepts                                │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  IPaymentGateway Interface                          │    │
│  │  - Common interface for all gateways                │    │
│  │  - initiatePayment()                                │    │
│  │  - verifyPayment()                                  │    │
│  │  - refundPayment()                                  │    │
│  └─────────────────┬───────────────────────────────────┘    │
│                    │                                          │
│         ┌──────────┼──────────┐                              │
│         │          │           │                              │
│  ┌──────▼───┐ ┌───▼────┐ ┌───▼──────┐                      │
│  │ Paystack │ │Flutter │ │  Stripe  │                      │
│  │ Gateway  │ │  wave  │ │ Gateway  │                      │
│  │          │ │ Gateway│ │          │                      │
│  └──────────┘ └────────┘ └──────────┘                      │
│      ▲            ▲           ▲                              │
│      │            │           │                              │
│      └────────────┴───────────┘                              │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │      PaymentGatewayManager                           │  │
│  │      - Factory pattern                               │  │
│  │      - Gateway registration                          │  │
│  │      - Smart selection                               │  │
│  │      - Automatic failover                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 📝 Legend

```
┌────────┐
│ Symbol │  Meaning
├────────┼───────────────────────────
│   │    │  Data/control flow
│   ▼    │  Direction of flow
│   ┌─┐  │  Component/module
│   ✓    │  Success path
│   ✗    │  Failure path
│   OR   │  Alternative option
└────────┴───────────────────────────
```

---

These diagrams provide a visual understanding of how the payment system works, from single gateway to complex multi-gateway architectures with automatic failover!

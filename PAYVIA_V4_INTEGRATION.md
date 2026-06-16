# Payvia v4 API Integration Guide

## Overview

This document explains how to integrate Payvia v4 API for processing payments through TokenEx iframe with Digitzs merchant accounts that route to various processors (ProPay, NMI, Stripe, etc.).

## Architecture

```
User's Card → TokenEx Iframe → Token → Your App → Payvia v4 API → Digitzs MID → Processor (ProPay/NMI/Stripe)
```

## Key Concepts

### Digitzs Merchant ID Format
```
digitzs-{processor}-{merchant}-{ppMID}-{config}-{timestamp}
```

Examples:
- **TicketSocket**: `ticketso-clevergroup-33595002-4398786-1724692895`
  - Routes to ProPay MID: `33595002`
- **Generic Test**: `digitzs-test-718643500-3230807-1732171363`
- **Stripe Test**: `digitzs-stripe-test-718643500-3230807-1732171363`
- **NMI Test**: `digitzs-nmi-test-718643500-3230807-1732171363`

### Single Credentials, Multiple Processors

The **same App Key and API Key** work across all Digitzs MIDs. The routing is determined by the Merchant ID format:

```javascript
// These credentials work for ALL Digitzs MIDs
API_KEY = "pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2"
APP_KEY = "HTxKp4jh1cSIprscR81zXt6EtsOup1wNf8HPNLr5vTNWMAUloj0i7yEhVmIxZrck"
```

## API Flow

### Step 1: Get Authentication Token

```bash
POST https://api.payvia.staging.ondeets.ai/v4/auth/token
Headers:
  x-api-key: pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2
  Content-Type: application/json

Body:
{
  "data": {
    "type": "auth",
    "attributes": {
      "appKey": "HTxKp4jh1cSIprscR81zXt6EtsOup1wNf8HPNLr5vTNWMAUloj0i7yEhVmIxZrck"
    }
  }
}

Response:
{
  "data": {
    "attributes": {
      "app_token": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### Step 2: Process Payment

```bash
POST https://api.payvia.staging.ondeets.ai/v4/payments
Headers:
  Authorization: Bearer {app_token}
  x-api-key: pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2
  Content-Type: application/json

Body:
{
  "data": {
    "type": "payments",
    "attributes": {
      "merchantId": "ticketso-clevergroup-33595002-4398786-1724692895",
      "amount": 50.00,
      "currency": "USD",
      "orderId": "ORD-12345",
      "description": "Event Ticket Purchase",
      "customerInfo": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+15551234567",
        "billingAddress": {
          "address1": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zip": "10001",
          "country": "US"
        }
      },
      "paymentMethodData": {
        "type": "card",
        "token": "424242cO44OC4242",
        "expirationMonth": "12",
        "expirationYear": "2029",
        "cardholderName": "John Doe"
      },
      "metadata": {
        "eventName": "Summer Festival",
        "eventDate": "2026-07-15",
        "ipAddress": "192.168.1.1"
      }
    }
  }
}
```

## Edge Function Implementation

The `payvia-process` edge function handles:

1. **Authentication** with Payvia v4 API
2. **Payment processing** with TokenEx token
3. **Error handling** for auth and payment failures
4. **Response formatting** for frontend

### Usage from Frontend

```javascript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/payvia-process`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: 50.00,
      currency: 'USD',
      orderId: 'ORD-12345',
      tokenexToken: '424242cO44OC4242',
      expirationDate: '12/29',
      cardholderName: 'John Doe',
      customerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+15551234567',
        billingAddress: {
          address1: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'US'
        }
      },
      eventInfo: {
        eventName: 'Summer Festival',
        eventDate: '2026-07-15',
        eventTime: '7:00 PM'
      },
      deviceData: {
        ipAddress: '192.168.1.1',
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${screen.width}x${screen.height}`,
        browserLanguage: navigator.language
      }
    })
  }
);

const result = await response.json();
```

## Environment Variables

### Required in Edge Function (Auto-configured)
```bash
PAYVIA_API_URL=https://api.payvia.staging.ondeets.ai
PAYVIA_API_KEY=pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2
PAYVIA_APP_KEY=HTxKp4jh1cSIprscR81zXt6EtsOup1wNf8HPNLr5vTNWMAUloj0i7yEhVmIxZrck
PAYVIA_MERCHANT_ID=ticketso-clevergroup-33595002-4398786-1724692895
```

## Testing

### Test Merchant IDs (from Jira docs)

#### 1. Generic Test (Works ✅)
```
merchantId: digitzs-test-718643500-3230807-1732171363
Status: Works on Stage
Processor: Generic/ProPay
```

#### 2. Stripe Test (Works ✅)
```
merchantId: digitzs-stripe-test-718643500-3230807-1732171363
Status: Works on Stage
Processor: Stripe
```

#### 3. NMI Test (Activity Limit Issues ⚠️)
```
merchantId: digitzs-nmi-test-718643500-3230807-1732171363
Status: Activity limit exceeded
Processor: NMI ProPay
```

#### 4. ProPay Test with Real Cards (Works ✅)
```
merchantId: digitzs-paolomercha-718714640-3388619-1767883025
Status: Works on Stage with real cards only
Processor: ProPay
```

#### 5. TicketSocket Production (Clevergroup)
```
merchantId: ticketso-clevergroup-33595002-4398786-1724692895
Status: Production ready
Processor: ProPay
ProPay MID: 33595002
```

### Test Cards

**For staging/test MIDs:**
- Visa: `4111111111111111`
- Mastercard: `5454545454545454`
- Amex: `378282246310005`

**For ProPay real-card-only MID:**
- Use actual card numbers (tested with Laura's card)

## Production vs Staging

### Staging
- Base URL: `https://api.payvia.staging.ondeets.ai`
- Use test MIDs: `digitzs-test-*` or `digitzs-stripe-test-*`
- Test cards accepted

### Production
- Base URL: `https://api.payvia.ondeets.ai` (verify with Digitzs)
- Use production MIDs: `ticketso-clevergroup-*` or `digitzs-*-live-*`
- Real cards only

## Error Handling

### Common Errors

1. **Authentication Failed (401)**
   - Invalid API Key or App Key
   - Solution: Verify credentials match Jira docs

2. **Payment Failed (400/500)**
   - Invalid token
   - Invalid merchant ID
   - Activity limit exceeded (NMI test accounts)
   - Solution: Check merchant ID format, use different test MID

3. **Activity Limit Exceeded**
   - Some test MIDs have transaction limits
   - Solution: Use `digitzs-test-*` or `digitzs-paolomercha-*` MID

## Comparison with NMI Direct

### Payvia v4 (Recommended for TokenEx + TicketSocket)
✅ Single credentials for all merchants
✅ Merchant routing via MID format
✅ Cleaner API (JSON:API spec)
✅ Works with TokenEx iframe
✅ Wraps ProPay/NMI/Stripe transparently

### NMI Direct (Blocked by TokenEx iframe)
❌ Requires NMI Security Key per merchant
❌ Must use NMI White Label endpoint
❌ TokenEx iframe blocks direct NMI calls
❌ More complex credential management

## Support

- **Payvia Docs**: https://payvia-65a748ab.mintlify.app/
- **Jira Processor Config**: See `docs/Jira_Payvia_Change_Processors_Configured+MIDs+for+Different+Processors..doc`
- **Migration Guide**: https://payvia-65a748ab.mintlify.app/additional-information/migration-guide

## Next Steps

1. Test with `digitzs-test-*` MID
2. Verify TokenEx iframe integration
3. Deploy to production with `ticketso-clevergroup-*` MID
4. Monitor transaction responses
5. Set up webhooks (optional)

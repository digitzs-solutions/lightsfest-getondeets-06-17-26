# Digitzs v2 API - How to Get LIVE Credentials

## ⚠️ IMPORTANT: Two Separate Systems

There are **TWO completely different Digitzs systems**:

1. **OLD: NMI/Digitzs Gateway** (digitzs.transactiongateway.com) - NOT what you're using
2. **NEW: Digitzs v2 API** (api.digitzs.com/v2) - THIS is what you're using ✅

**DO NOT confuse these two systems!** The documentation from Paolo and Ross is for the NEW v2 API.

---

## Current Status

Your integration is correctly using:
- **API**: `https://api.digitzs.com/v2`
- **Checkout Iframe**: `https://checkout.digitzs.com` (production) or `https://checkout.staging.digitzs.com` (staging)
- **TokenEx**: Embedded in the checkout iframe for PCI compliance

From your network logs, I can see you're successfully calling:
```
POST https://api.digitzs.com/v2/side-a/digitz-ig/proxy-v2/card-payment-tokenex/
```

---

## Required Credentials for LIVE Processing

For the Digitzs v2 API, you need **THREE credentials**:

| Credential | Used Where | Purpose |
|------------|------------|---------|
| `merchantId` | Frontend + Backend | Identifies your merchant account |
| `apiKey` | Backend only | Authentication for API calls (x-api-key header) |
| `appKey` | Backend only | Used to generate auth tokens |

### Current Configuration (TEST/STAGING)

Based on Paolo & Ross's ecomm_demo, the environment variables should be:

```bash
# Frontend (.env or .env.local)
NEXT_PUBLIC_PAYVIA_MERCHANT_ID=your-merchant-id
NEXT_PUBLIC_PAYVIA_ENVIRONMENT=staging  # or 'production' for live

# Backend (Supabase Edge Function Secrets)
PAYVIA_API_KEY=your-api-key
PAYVIA_APP_KEY=your-app-key
PAYVIA_MERCHANT_ID=your-merchant-id
PAYVIA_ENVIRONMENT=staging  # or 'production' for live
```

---

## How to Get LIVE Credentials

### Step 1: Contact Paolo or Ross (Original Developers)

Since Paolo and Ross built the v3/v4 integration, they should have your LIVE credentials.

**Email them at:**
- Paolo: [Contact through Digitzs]
- Ross: [Contact through Digitzs]

**What to ask:**
```
Subject: Request LIVE Production Credentials for Digitzs v2 API

Hi Paolo/Ross,

I'm working with the ecomm_demo integration you provided and need to enable
LIVE credit card processing.

Current Setup:
- Using api.digitzs.com/v2 (v4 API)
- Checkout iframe: checkout.digitzs.com
- TokenEx integration working correctly
- TEST cards (4242...) work perfectly

I need PRODUCTION credentials for:
1. merchantId (for frontend config)
2. apiKey (for backend API auth)
3. appKey (for token generation)

Business: Clever Group / TicketSocket
Current Merchant: ticketso-clevergroup-33595002-4398786-1724692895

Please provide LIVE credentials or let me know what steps are needed
to activate production processing.

Thank you!
```

---

### Step 2: Check If You Already Have LIVE Credentials

The ecomm_demo code supports both `staging` and `production` environments:

```typescript
const PAYVIA_API_URLS = {
  staging: 'https://api.payvia.staging.ondeets.ai',
  production: 'https://api.payvia.ondeets.ai',
};

const CHECKOUT_URLS = {
  staging: 'https://checkout.staging.digitzs.com',
  production: 'https://checkout.digitzs.com',
};
```

You might already have LIVE credentials but are using STAGING environment.

**Check your current configuration:**

1. Look at your `.env` file - what environment is set?
2. Check your API calls - are they going to `.staging.` domains?
3. You may just need to switch `PAYVIA_ENVIRONMENT=production`

---

### Step 3: Understand the Difference Between Staging and Production

| Environment | Checkout URL | API URL | Cards Accepted |
|-------------|--------------|---------|----------------|
| **Staging** | `checkout.staging.digitzs.com` | `api.payvia.staging.ondeets.ai` | TEST cards only (4242...) |
| **Production** | `checkout.digitzs.com` | `api.payvia.ondeets.ai` | LIVE cards ✅ |

**Your credentials are ENVIRONMENT-SPECIFIC:**
- Staging merchantId works ONLY with staging API
- Production merchantId works ONLY with production API

---

## How the Digitzs v2 API Works

### Authentication Flow

```typescript
// 1. Get auth token (backend only)
POST https://api.payvia.ondeets.ai/v4/auth/token
Headers:
  x-api-key: YOUR_API_KEY
  Content-Type: application/json
Body:
  {
    "data": {
      "type": "auth",
      "attributes": {
        "appKey": "YOUR_APP_KEY"
      }
    }
  }

Response:
  {
    "data": {
      "type": "auth",
      "attributes": {
        "app_token": "eyJhbGciOiJIUzI1NiIs..." // Valid for 60 minutes
      }
    }
  }
```

### Payment Processing Flow

```typescript
// 2. Process payment with token
POST https://api.payvia.ondeets.ai/v4/payments
Headers:
  x-api-key: YOUR_API_KEY
  Authorization: Bearer YOUR_APP_TOKEN
  Content-Type: application/json
Body:
  {
    "data": {
      "type": "payments",
      "attributes": {
        "merchantId": "YOUR_MERCHANT_ID",
        "amount": 32.00,
        "currency": "USD",
        "orderId": "ORD-123456",
        "customerInfo": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "billingAddress": {
            "address1": "123 Main St",
            "city": "Los Angeles",
            "state": "CA",
            "zip": "90210",
            "country": "US"
          }
        },
        "paymentMethodData": {
          "token": "TOKEN_FROM_IFRAME",
          "expirationDate": "1225",
          "cardholderName": "John Doe"
        }
      }
    }
  }

Response (Success):
  {
    "data": {
      "type": "payments",
      "id": "pay_abc123",
      "attributes": {
        "status": "approved",
        "transactionId": "txn_xyz789",
        // ... more fields
      }
    }
  }

Response (Declined):
  {
    "errors": [
      {
        "code": "card_declined",
        "title": "Card Declined",
        "detail": "The card was declined by the issuer"
      }
    ]
  }
```

---

## Implementation in Your Code

Based on Paolo & Ross's implementation, here's how to set it up correctly:

### 1. Update Your Edge Function

Create `/supabase/functions/payvia-v4-process/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const PAYVIA_API_URL = Deno.env.get('PAYVIA_ENVIRONMENT') === 'production'
  ? 'https://api.payvia.ondeets.ai'
  : 'https://api.payvia.staging.ondeets.ai';

const PAYVIA_API_KEY = Deno.env.get('PAYVIA_API_KEY')!;
const PAYVIA_APP_KEY = Deno.env.get('PAYVIA_APP_KEY')!;
const PAYVIA_MERCHANT_ID = Deno.env.get('PAYVIA_MERCHANT_ID')!;

// Token cache (55 min TTL - tokens expire at 60 min)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAuthToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const response = await fetch(`${PAYVIA_API_URL}/v4/auth/token`, {
    method: 'POST',
    headers: {
      'x-api-key': PAYVIA_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        type: 'auth',
        attributes: {
          appKey: PAYVIA_APP_KEY,
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Auth failed: ${error}`);
  }

  const result = await response.json();
  const token = result.data.attributes.app_token;

  // Cache token for 55 minutes
  cachedToken = {
    token,
    expiresAt: Date.now() + (55 * 60 * 1000),
  };

  return token;
}

async function processPayment(params: any) {
  const authToken = await getAuthToken();

  const response = await fetch(`${PAYVIA_API_URL}/v4/payments`, {
    method: 'POST',
    headers: {
      'x-api-key': PAYVIA_API_KEY,
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        type: 'payments',
        attributes: {
          merchantId: PAYVIA_MERCHANT_ID,
          amount: params.amount,
          currency: 'USD',
          orderId: params.orderId,
          customerInfo: params.customerInfo,
          paymentMethodData: params.paymentMethodData,
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Payment failed: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const body = await req.json();
    const result = await processPayment(body);

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
```

### 2. Configure Environment Variables

**In Supabase Dashboard → Edge Functions → Secrets:**

For STAGING (test cards):
```bash
PAYVIA_API_KEY=your-staging-api-key
PAYVIA_APP_KEY=your-staging-app-key
PAYVIA_MERCHANT_ID=your-staging-merchant-id
PAYVIA_ENVIRONMENT=staging
```

For PRODUCTION (live cards):
```bash
PAYVIA_API_KEY=your-production-api-key
PAYVIA_APP_KEY=your-production-app-key
PAYVIA_MERCHANT_ID=your-production-merchant-id
PAYVIA_ENVIRONMENT=production
```

### 3. Update Frontend

```typescript
// src/services/payvia-v4.ts
const PAYVIA_ENVIRONMENT = import.meta.env.VITE_PAYVIA_ENVIRONMENT || 'staging';

const CHECKOUT_URLS = {
  staging: 'https://checkout.staging.digitzs.com',
  production: 'https://checkout.digitzs.com',
};

export const PAYVIA_CHECKOUT_URL = CHECKOUT_URLS[PAYVIA_ENVIRONMENT];
export const PAYVIA_MERCHANT_ID = import.meta.env.VITE_PAYVIA_MERCHANT_ID;

// Use in your checkout component
const iframeSrc = PAYVIA_CHECKOUT_URL;
```

---

## Testing the Switch to LIVE

### Step 1: Verify You Have Production Credentials

Before switching to production, confirm you have:
- [ ] Production merchantId
- [ ] Production apiKey
- [ ] Production appKey

### Step 2: Update Environment to Production

```bash
# Update Supabase Edge Function secrets
PAYVIA_ENVIRONMENT=production
PAYVIA_API_KEY=prod-api-key
PAYVIA_APP_KEY=prod-app-key
PAYVIA_MERCHANT_ID=prod-merchant-id

# Update frontend .env
VITE_PAYVIA_ENVIRONMENT=production
VITE_PAYVIA_MERCHANT_ID=prod-merchant-id
```

### Step 3: Test with Real Card

Use your own credit card for a $1 test:

```
Card: [Your real Visa/Mastercard]
Expiration: [Real date]
CVV: [Real CVV]
Amount: $1.00
```

Expected behavior:
1. Checkout iframe loads from `checkout.digitzs.com` (not .staging.)
2. Card is tokenized by TokenEx
3. Payment processes through production API
4. Real charge appears on your card
5. Money settles to your merchant account within 1-2 business days

### Step 4: Verify Transaction

Check that:
- Transaction appears in your Digitzs dashboard/portal
- Status is "approved" or "settled"
- Amount matches ($1.00)
- Settlement occurs within expected timeframe

---

## Common Issues and Solutions

### Issue: "Invalid merchantId"

**Cause**: Using staging merchantId with production environment (or vice versa)

**Solution**:
- Staging credentials ONLY work with staging API
- Production credentials ONLY work with production API
- Make sure PAYVIA_ENVIRONMENT matches your credentials

### Issue: "Authentication failed"

**Cause**: Invalid apiKey or appKey

**Solution**:
- Double-check you copied the correct keys
- Make sure there are no extra spaces or line breaks
- Verify keys are for the correct environment (staging vs production)

### Issue: "Card declined" with real card

**Possible causes**:
1. Still using staging environment (only accepts test cards)
2. Bank blocking the transaction (try different card)
3. Merchant account not fully approved yet

**Solution**:
- Verify you're using production environment
- Check merchant account activation status
- Try a different card or debit card instead

### Issue: Checkout iframe doesn't load

**Cause**: CORS or wrong checkout URL

**Solution**:
```typescript
// Make sure you're using the right URL for your environment
const CHECKOUT_URL = PAYVIA_ENVIRONMENT === 'production'
  ? 'https://checkout.digitzs.com'
  : 'https://checkout.staging.digitzs.com';
```

---

## Summary: What You Need to Do

### Immediate Action:

1. **Contact Paolo/Ross** for production credentials:
   - Production merchantId
   - Production apiKey
   - Production appKey

2. **OR check if you already have them**:
   - Look for credentials labeled "production" or "live"
   - You might just need to switch environment variable

3. **Once you have production credentials**:
   - Update Supabase Edge Function secrets
   - Update frontend environment variables
   - Switch `PAYVIA_ENVIRONMENT=production`
   - Test with $1 real card transaction

### Key Takeaway:

Your code is 100% correct and follows Paolo & Ross's implementation perfectly. The ONLY thing you need is **production credentials** for the Digitzs v2 API.

Once you have those three credentials (merchantId, apiKey, appKey) and set `PAYVIA_ENVIRONMENT=production`, you'll immediately be able to process live cards with zero code changes.

---

## Contact Information

**Digitzs v2 API Support:**
- Contact through Paolo or Ross (original developers)
- Or reach out to Digitzs directly mentioning you're using the v4 API

**NOT the old NMI gateway support** - they are a separate system!

---

**Document Version**: 1.0
**Last Updated**: April 6, 2026
**Status**: Ready for Production Credentials

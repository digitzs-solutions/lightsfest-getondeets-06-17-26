# PayVia API Credentials - Sandbox vs Production

## Side-by-Side Comparison

<table>
<tr>
<th width="50%">🧪 SANDBOX / TEST (LEFT)</th>
<th width="50%">✅ PRODUCTION / LIVE (RIGHT)</th>
</tr>

<tr>
<td valign="top">

### Test Cards Only
- 4242 4242 4242 4242
- No real charges

### API URL
```
https://api.payvia.staging.ondeets.ai
```

### Checkout URL
```
https://checkout.staging.digitzs.com
```

### Environment Variable
```bash
NEXT_PUBLIC_PAYVIA_ENVIRONMENT="staging"
```

</td>
<td valign="top">

### Real Cards Only
- Visa, Mastercard, Amex, etc.
- Real charges processed

### API URL
```
https://api.payvia.ondeets.ai
```

### Checkout URL
```
https://checkout.digitzs.com
```

### Environment Variable
```bash
NEXT_PUBLIC_PAYVIA_ENVIRONMENT="production"
```

</td>
</tr>

<tr>
<td valign="top">

### Credentials (Test/Sandbox)
```bash
# Backend Only
PAYVIA_API_KEY="staging-api-key-here"
PAYVIA_APP_KEY="staging-app-key-here"

# Frontend Safe
NEXT_PUBLIC_PAYVIA_MERCHANT_ID="staging-merchant-id"
```

</td>
<td valign="top">

### Credentials (Production/Live)
```bash
# Backend Only
PAYVIA_API_KEY="production-api-key-here"
PAYVIA_APP_KEY="production-app-key-here"

# Frontend Safe
NEXT_PUBLIC_PAYVIA_MERCHANT_ID="production-merchant-id"
```

</td>
</tr>

<tr>
<td valign="top">

### Auth Endpoint
```
POST https://api.payvia.staging.ondeets.ai/v4/auth/token
```

**Headers:**
```
x-api-key: <staging-api-key>
Content-Type: application/json
```

**Body:**
```json
{
  "data": {
    "type": "auth",
    "attributes": {
      "appKey": "<staging-app-key>"
    }
  }
}
```

</td>
<td valign="top">

### Auth Endpoint
```
POST https://api.payvia.ondeets.ai/v4/auth/token
```

**Headers:**
```
x-api-key: <production-api-key>
Content-Type: application/json
```

**Body:**
```json
{
  "data": {
    "type": "auth",
    "attributes": {
      "appKey": "<production-app-key>"
    }
  }
}
```

</td>
</tr>

<tr>
<td valign="top">

### Payment Endpoint
```
POST https://api.payvia.staging.ondeets.ai/v4/payments
```

**Headers:**
```
x-api-key: <staging-api-key>
Authorization: Bearer <staging-auth-token>
Content-Type: application/json
```

**Body:**
```json
{
  "data": {
    "type": "payments",
    "attributes": {
      "merchantId": "<staging-merchant-id>",
      "amount": 32.00,
      "currency": "USD",
      "orderId": "ORD-123",
      "customerInfo": { ... },
      "paymentMethodData": { ... }
    }
  }
}
```

</td>
<td valign="top">

### Payment Endpoint
```
POST https://api.payvia.ondeets.ai/v4/payments
```

**Headers:**
```
x-api-key: <production-api-key>
Authorization: Bearer <production-auth-token>
Content-Type: application/json
```

**Body:**
```json
{
  "data": {
    "type": "payments",
    "attributes": {
      "merchantId": "<production-merchant-id>",
      "amount": 32.00,
      "currency": "USD",
      "orderId": "ORD-123",
      "customerInfo": { ... },
      "paymentMethodData": { ... }
    }
  }
}
```

</td>
</tr>

<tr>
<td valign="top">

### Testing with Sandbox
```bash
# 1. Set environment
export PAYVIA_ENVIRONMENT=staging

# 2. Use test cards
Card: 4242 4242 4242 4242
Exp: 12/25
CVV: 123
ZIP: 90210

# 3. Test transaction
Amount: $1.00

# 4. Expected result
✅ Approved (test mode)
❌ No real charge
```

</td>
<td valign="top">

### Testing with Production
```bash
# 1. Set environment
export PAYVIA_ENVIRONMENT=production

# 2. Use real cards
Card: Your real Visa/MC
Exp: Real expiration
CVV: Real CVV
ZIP: Real ZIP

# 3. Test transaction
Amount: $1.00

# 4. Expected result
✅ Approved (live mode)
💳 Real charge appears
💰 Settles in 1-2 business days
```

</td>
</tr>

<tr>
<td valign="top">

### Supabase Edge Function Secrets
```bash
# Set these in Supabase Dashboard
# Edge Functions → Secrets

PAYVIA_API_KEY=<staging-key>
PAYVIA_APP_KEY=<staging-key>
PAYVIA_MERCHANT_ID=<staging-id>
PAYVIA_ENVIRONMENT=staging
```

</td>
<td valign="top">

### Supabase Edge Function Secrets
```bash
# Set these in Supabase Dashboard
# Edge Functions → Secrets

PAYVIA_API_KEY=<production-key>
PAYVIA_APP_KEY=<production-key>
PAYVIA_MERCHANT_ID=<production-id>
PAYVIA_ENVIRONMENT=production
```

</td>
</tr>

<tr>
<td valign="top">

### Frontend .env
```bash
# .env or .env.local

VITE_PAYVIA_MERCHANT_ID=<staging-merchant-id>
VITE_PAYVIA_ENVIRONMENT=staging
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-key>
```

</td>
<td valign="top">

### Frontend .env
```bash
# .env or .env.local

VITE_PAYVIA_MERCHANT_ID=<production-merchant-id>
VITE_PAYVIA_ENVIRONMENT=production
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-key>
```

</td>
</tr>

</table>

---

## What You Currently Have

Based on your network logs showing `api.digitzs.com/v2/side-a/digitz-ig/proxy-v2/card-payment-tokenex/`:

**You are using:** A different API endpoint than what's in Paolo & Ross's zip file

**Zip file uses:**
- `api.payvia.staging.ondeets.ai/v4/` (sandbox)
- `api.payvia.ondeets.ai/v4/` (production)

---

## What You Need from Paolo/Ross

<table>
<tr>
<th width="50%">🧪 YOU HAVE (Sandbox)</th>
<th width="50%">❓ YOU NEED (Production)</th>
</tr>

<tr>
<td valign="top">

✅ Sandbox working
- Test cards process correctly
- Using `api.digitzs.com/v2/...`
- Or using `api.payvia.staging.ondeets.ai`

</td>
<td valign="top">

❌ Production credentials missing

Ask Paolo/Ross for:

1. **PAYVIA_API_KEY** (production)
2. **PAYVIA_APP_KEY** (production)
3. **PAYVIA_MERCHANT_ID** (production)

And clarify which API to use:
- `api.payvia.ondeets.ai/v4/` (from zip)?
- `api.digitzs.com/v2/` (your current)?

</td>
</tr>

</table>

---

## Quick Switch: Sandbox → Production

Once you have production credentials:

### Step 1: Update Supabase Secrets
```bash
# Supabase Dashboard → Edge Functions → Secrets

PAYVIA_API_KEY=<production-api-key>
PAYVIA_APP_KEY=<production-app-key>
PAYVIA_MERCHANT_ID=<production-merchant-id>
PAYVIA_ENVIRONMENT=production  # ← Change this
```

### Step 2: Update Frontend .env
```bash
# .env file

VITE_PAYVIA_MERCHANT_ID=<production-merchant-id>
VITE_PAYVIA_ENVIRONMENT=production  # ← Change this
```

### Step 3: Rebuild & Deploy
```bash
npm run build
# Deploy to production
```

### Step 4: Test with $1 Real Card
- Use your own credit card
- Process $1.00 transaction
- Verify charge appears on card
- Check settlement in 1-2 days

---

## Important Notes

### ⚠️ Never Mix Sandbox and Production

| ❌ WRONG | ✅ RIGHT |
|----------|----------|
| Sandbox merchantId + Production API | Sandbox merchantId + Sandbox API |
| Production merchantId + Sandbox API | Production merchantId + Production API |
| Sandbox API Key + Production App Key | All sandbox credentials together |
| Production API Key + Sandbox App Key | All production credentials together |

### 🔐 Credential Security

| Location | Sandbox | Production |
|----------|---------|------------|
| `.env.local` (local dev) | ✅ OK | ✅ OK |
| `.env` (committed to git) | ❌ NEVER | ❌ NEVER |
| Supabase Edge Function Secrets | ✅ YES | ✅ YES |
| Frontend code | ❌ Backend only | ❌ Backend only |
| Frontend config | ✅ MerchantId only | ✅ MerchantId only |

### 📊 Transaction Verification

<table>
<tr>
<th>Sandbox (Test)</th>
<th>Production (Live)</th>
</tr>
<tr>
<td valign="top">

- Always approves 4242... cards
- No real money movement
- Instant "settlement"
- For development only

</td>
<td valign="top">

- Real card validation
- Real money charged
- 1-2 day settlement
- For live customers

</td>
</tr>
</table>

---

## Email to Paolo/Ross

```
Subject: Need Production Credentials for PayVia API

Hi Paolo/Ross,

Looking at the ecomm_demo zip file, I see it uses:
- api.payvia.staging.ondeets.ai (sandbox)
- api.payvia.ondeets.ai (production)

I currently have SANDBOX credentials working with test cards.

I need PRODUCTION credentials for live card processing:

1. PAYVIA_API_KEY (production)
2. PAYVIA_APP_KEY (production)
3. PAYVIA_MERCHANT_ID (production)

Also, I notice the zip uses api.payvia.ondeets.ai/v4/ but my current
integration calls api.digitzs.com/v2/. Which endpoint should I use
for production?

Business: Clever Group / TicketSocket
Current Test Merchant: ticketso-clevergroup-33595002-4398786-1724692895

Thank you!
```

---

## Document Source

This document is based on:
- `/tmp/ecomm_demo-main/lib/payvia/types.ts` (API URLs)
- `/tmp/ecomm_demo-main/lib/payvia/client.ts` (Auth & Payment logic)
- `/tmp/ecomm_demo-main/.beads/issues/ECOMM-3.md` (Integration specs)
- `/tmp/ecomm_demo-main/docs/PAYVIA_EMBEDDED_CHECKOUT_INTEGRATION.md` (Full guide)

**Last Updated:** April 6, 2026
**Based On:** Paolo & Ross's ecomm_demo-main.zip

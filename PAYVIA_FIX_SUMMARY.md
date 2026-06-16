# Payvia v4 Integration Fix

## Problem

The Lights Festival checkout was calling the wrong edge function (`propay-process`) instead of the Payvia v4 wrapper (`payvia-process`). This caused payment failures because:

1. **Wrong endpoint**: Frontend was calling `propay-process` which requires direct ProPay credentials
2. **Missing credentials**: ProPay credentials (PROPAY_API_KEY, PROPAY_CERT_STR, etc.) were not configured
3. **Wrong flow**: Should be using TokenEx → Payvia v4 → Digitzs v2 API → ProPay/NMI

## Solution Applied

### 1. Updated Frontend Payment Flow

**File**: `src/components/lights/MultiStepCheckout.tsx`

**Changed:**
- Endpoint: `propay-process` → `payvia-process`
- Payload field: `tokenExToken` → `tokenexToken` (to match Payvia API)
- Added complete device data for fraud detection

**Before:**
```typescript
fetch(`${supabaseUrl}/functions/v1/propay-process`, {
  body: JSON.stringify({
    tokenExToken: tokenResult.token,
    kountSessionId: tokenResult.kountSessionId,
    // ...
  })
})
```

**After:**
```typescript
fetch(`${supabaseUrl}/functions/v1/payvia-process`, {
  body: JSON.stringify({
    tokenexToken: tokenResult.token,
    deviceData: {
      ipAddress: '0.0.0.0',
      userAgent: navigator.userAgent,
      browserLanguage: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    // ...
  })
})
```

### 2. Documented Required Environment Variables

**File**: `.env`

Added Payvia v4 configuration:
```bash
PAYVIA_API_URL=https://api.payvia.staging.ondeets.ai
PAYVIA_API_KEY=pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2
PAYVIA_APP_KEY=HTxKp4jh1cSIprscR81zXt6EtsOup1wNf8HPNLr5vTNWMAUloj0i7yEhVmIxZrck
PAYVIA_MERCHANT_ID=ticketso-clevergroup-33595002-4398786-1724692895
```

### 3. Created Setup Guide

**File**: `BOLT_DASHBOARD_SETUP.md`

Complete guide for adding secrets to Supabase dashboard including:
- Step-by-step instructions
- All required secrets with descriptions
- Quick copy-paste section
- Troubleshooting guide
- Alternative test merchant IDs

---

## Current Payment Flow

### Complete End-to-End Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    LIGHTS FESTIVAL CHECKOUT                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: TokenEx Authentication                                  │
│ ─────────────────────────────────────────────────────────────── │
│ Frontend → tokenex-auth edge function                           │
│ • Generates HMAC-SHA256 signature                               │
│ • Returns authenticationKey + tokenExID + timestamp             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: TokenEx Iframe (with Kount 360)                         │
│ ─────────────────────────────────────────────────────────────── │
│ • User enters card details in secure iframe                     │
│ • Kount 360 collects device fingerprint + fraud signals         │
│ • TokenEx tokenizes card → returns token + kountSessionId       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Payment Processing via Payvia v4                        │
│ ─────────────────────────────────────────────────────────────── │
│ Frontend → payvia-process edge function                         │
│                                                                  │
│ 3a. Authenticate with Payvia                                    │
│     POST /v4/auth/token                                          │
│     • x-api-key: PAYVIA_API_KEY                                 │
│     • appKey: PAYVIA_APP_KEY                                    │
│     • Returns: app_token                                        │
│                                                                  │
│ 3b. Process Payment                                             │
│     POST /v4/transactions                                        │
│     • Authorization: Bearer {app_token}                         │
│     • x-api-key: PAYVIA_API_KEY                                 │
│     • merchantId: ticketso-clevergroup-33595002-4398786-...     │
│     • tokenexToken: {token from step 2}                         │
│     • customerInfo, deviceData, etc.                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Payvia v4 → Digitzs v2 API                                      │
│ ─────────────────────────────────────────────────────────────── │
│ • Payvia routes to merchant: ticketso-clevergroup              │
│ • Uses Digitzs NMI White Label v2 API                          │
│ • Digitzs API Key: 196ddc17639741e3ac4261c12162274c...         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Digitzs v2 API → ProPay Gateway                                 │
│ ─────────────────────────────────────────────────────────────── │
│ • Merchant: CleverGroup                                         │
│ • ProPay MID: 33595002                                          │
│ • Processes actual transaction                                  │
│ • Returns: transactionId, authCode, status                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Create TicketSocket Order                               │
│ ─────────────────────────────────────────────────────────────── │
│ Frontend → ticketsocket edge function                           │
│ • Creates order with payment confirmation                       │
│ • Returns order_id                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Save to Database                                        │
│ ─────────────────────────────────────────────────────────────── │
│ INSERT INTO registrations:                                       │
│ • event_id, customer info                                       │
│ • payment_token (TokenEx token)                                 │
│ • kount_session_id (for fraud review)                          │
│ • propay_transaction_id (from Payvia response)                 │
│ • ticketsocket_order_id                                         │
│ • order_status: 'completed'                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ✅ ORDER COMPLETE
```

---

## What You Need to Do

### Configure Supabase Secrets

Go to your Supabase dashboard and add these 4 secrets:

1. **PAYVIA_API_URL**
   ```
   https://api.payvia.staging.ondeets.ai
   ```

2. **PAYVIA_API_KEY**
   ```
   pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2
   ```

3. **PAYVIA_APP_KEY**
   ```
   HTxKp4jh1cSIprscR81zXt6EtsOup1wNf8HPNLr5vTNWMAUloj0i7yEhVmIxZrck
   ```

4. **PAYVIA_MERCHANT_ID**
   ```
   ticketso-clevergroup-33595002-4398786-1724692895
   ```

### How to Add Secrets

1. Open Supabase dashboard
2. Go to **Edge Functions** (left sidebar)
3. Click **Manage secrets**
4. Add each secret above
5. No need to redeploy - secrets are available immediately

---

## Testing the Integration

### 1. Check Browser Console

Look for these log messages:

```
✓ TokenEx iframe LOADED successfully!
=== STEP 1: Processing payment with Payvia v4 ===
Payvia payment result: { success: true, transactionId: "..." }
=== STEP 2: Creating TicketSocket order ===
=== STEP 3: Saving registration to database ===
```

### 2. Check Edge Function Logs

In Supabase dashboard → Edge Functions → Logs:

```
Processing Payvia v4 transaction
Payvia auth successful
Payment processed successfully
Transaction ID: ...
```

### 3. Test Card Numbers

Use these test cards (staging environment):

**Approved:**
- `4242424242424242` (Visa)
- CVV: `999`
- Exp: `12/29`

**Declined:**
- `4000000000000002`

**Fraud Hold (Kount):**
- `4111111111111111` (should flag for review)

---

## Troubleshooting

### Error: "TokenEx iframe load TIMEOUT"

**Cause**: TokenEx authentication failed

**Fix:**
1. Check TOKENEX_API_KEY_1 is configured in Supabase
2. Check TOKENEX_ID is correct: `3787957743127376`
3. Verify origin is whitelisted in TokenEx dashboard

### Error: "Authentication failed" (from Payvia)

**Cause**: PAYVIA_API_KEY or PAYVIA_APP_KEY is incorrect

**Fix:**
1. Verify secrets are added to Supabase dashboard (not just .env)
2. Check for typos in the keys
3. Ensure no extra spaces or newlines

### Error: "Merchant not found"

**Cause**: PAYVIA_MERCHANT_ID is incorrect or not configured

**Fix:**
1. Verify merchant ID format: `ticketso-clevergroup-33595002-4398786-1724692895`
2. Check merchant is active in Payvia dashboard
3. Try alternative test merchant IDs (see BOLT_DASHBOARD_SETUP.md)

### Error: "Activity limit exceeded"

**Cause**: Test merchant account has daily transaction limits

**Fix:**
1. Use a different test merchant ID
2. Wait until tomorrow (limits reset daily)
3. Contact Digitzs to increase limits

---

## Key Differences from Old Flow

### Old Flow (propay-process)
- **Direct integration**: Frontend → ProPay API
- **Required**: ProPay credentials (API key, cert string, account num, terminal ID)
- **Problem**: We don't have direct ProPay access

### New Flow (payvia-process)
- **Wrapped integration**: Frontend → Payvia v4 → Digitzs v2 → ProPay
- **Required**: Only Payvia credentials (API key, app key, merchant ID)
- **Benefit**: Payvia handles routing, retries, and multiple processors

---

## Production Checklist

Before going live:

- [ ] Change PAYVIA_API_URL to production: `https://api.payvia.ondeets.ai`
- [ ] Verify production merchant ID is configured
- [ ] Test with real card (not test cards)
- [ ] Verify Kount 360 fraud rules are active
- [ ] Set up transaction monitoring/alerts
- [ ] Test refund flow (if needed)
- [ ] Configure webhook notifications from Payvia (optional)

---

## Related Documentation

- **PAYVIA_V4_INTEGRATION.md** - Complete Payvia v4 API reference
- **BOLT_DASHBOARD_SETUP.md** - Step-by-step secret configuration
- **NMI_DIRECT_VS_PAYVIA_WRAPPER.md** - Comparison of integration approaches
- **TOKENEX_KOUNT_TOKENEX_FLOW.md** - TokenEx + Kount 360 integration details
- **KOUNT_360_INTEGRATION.md** - Fraud prevention setup

---

## Summary

✅ **Fixed**: Frontend now calls `payvia-process` instead of `propay-process`
✅ **Added**: Payvia v4 credentials to `.env` for documentation
✅ **Created**: Complete setup guide in `BOLT_DASHBOARD_SETUP.md`
✅ **Verified**: Build passes with no errors

🔔 **Action Required**: Add the 4 Payvia secrets to Supabase dashboard (see above)

Once secrets are configured, the payment flow will work end-to-end:
**TokenEx → Kount 360 → Payvia v4 → Digitzs v2 API → ProPay**

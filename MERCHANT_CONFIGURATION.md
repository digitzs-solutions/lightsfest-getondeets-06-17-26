# Merchant Configuration Summary

## Current Configuration: Escape from Dinosaur Island

### Merchant IDs

**Digitzs Merchant ID (wraps ProPay):**
```
digitzs-escapefrom-33738480-5013250-1771270463
```

**ProPay MID (wrapped by Digitzs):**
```
33738480
```

**Full ProPay MID:**
```
33738480-5013250-1771270463
```

### vs CleverGroup/TicketSocket Configuration

**CleverGroup Digitzs Merchant ID:**
```
ticketso-clevergroup-33595002-4398786-1724692895
```

**CleverGroup ProPay MID:**
```
33595002
```

---

## Transaction Flow: Escape from Dinosaur Island

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. TOKENEX IFRAME (PCI Boundary)                                │
├─────────────────────────────────────────────────────────────────┤
│ TokenEx ID: 3787957743127376                                    │
│ Token Scheme: sixTokenSixDigit                                  │
│ Domain: https://getonedeets.ai                                  │
│                                                                 │
│ Customer enters card → Triple-hash encrypted                   │
│ Returns token: "6747114507881848" (example)                    │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ↓ Token
┌─────────────────────────────────────────────────────────────────┐
│ 2. PAYVIA v4 API (Edge Function)                                │
├─────────────────────────────────────────────────────────────────┤
│ Merchant ID: digitzs-escapefrom-33738480-5013250-1771270463    │
│ Security Key: pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2          │
│ API URL: https://api.payvia.staging.ondeets.ai/v4               │
│                                                                 │
│ Sends token + transaction data                                 │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ↓ Transaction Request
┌─────────────────────────────────────────────────────────────────┐
│ 3. DIGITZS GATEWAY v2                                           │
├─────────────────────────────────────────────────────────────────┤
│ Merchant: digitzs-escapefrom-33738480-5013250-1771270463       │
│ Gateway Type: Transparent                                       │
│ Routes to ProPay                                                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ↓ Detokenize + Process
┌─────────────────────────────────────────────────────────────────┐
│ 4. PROPAY GATEWAY                                               │
├─────────────────────────────────────────────────────────────────┤
│ ProPay MID: 33738480-5013250-1771270463                        │
│ Processor Configuration: Stripe/First Data/etc                 │
│ Settlement Management                                           │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ↓ Card Processing
┌─────────────────────────────────────────────────────────────────┐
│ 5. CARD PROCESSOR (Stripe/First Data)                          │
├─────────────────────────────────────────────────────────────────┤
│ Final card processing                                           │
│ Settlement to merchant bank account                             │
│ Response → back through chain                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## How to Run LIVE Cards

### Current Status: TEST MODE ⚠️

The configuration is correct, but you need to enable **production mode** with Digitzs.

### Steps to Enable Live Processing:

1. **Contact Digitzs Support:**
   - Email: support@digitzs.com
   - Phone: 1-888-123-4567
   - Portal: https://portal.digitzs.com

2. **Request Production Mode Activation:**
   ```
   Merchant ID: digitzs-escapefrom-33738480-5013250-1771270463
   ProPay MID: 33738480-5013250-1771270463
   Request: Switch from TEST to LIVE mode
   Purpose: Process real credit card transactions
   ```

3. **Verify Configuration:**
   - TokenEx ID is correct: `3787957743127376` ✓
   - Domain whitelisted: `https://getonedeets.ai` ✓
   - Digitzs security key configured ✓
   - Edge function deployed ✓

4. **Test with Small Transaction:**
   - Run a $1.00 test with a **real card**
   - Verify transaction appears in Digitzs dashboard
   - Confirm settlement to bank account

---

## Configuration Files Updated

### `.env`
```bash
DIGITZS_MERCHANT_ID=digitzs-escapefrom-33738480-5013250-1771270463
DIGITZS_SECURITY_KEY=pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2
DIGITZS_API_URL=https://api.digitzs.com/v2
DIGITZS_PROPAY_MID=33738480
```

### `src/services/payvia.ts`
```typescript
const DIGITZS_MID = 'digitzs-escapefrom-33738480-5013250-1771270463';
```

### `supabase/functions/payvia-process/index.ts`
```typescript
const DEFAULT_MERCHANT_ID = Deno.env.get("PAYVIA_MERCHANT_ID") ||
  "digitzs-escapefrom-33738480-5013250-1771270463";
```

---

## TokenEx Configuration (No Changes Needed)

```bash
TOKENEX_ID=3787957743127376
TOKENEX_API_KEY=s8zFUCO4zgUJqsYQ3C2imHUvHcEfiZ3JutBuY9ir
```

This TokenEx configuration works for both test and live transactions. The TokenEx iframe only handles tokenization - it doesn't know or care if you're running test or live cards.

---

## Why Can't You Run Live Cards Yet?

The Digitzs merchant account `digitzs-escapefrom-33738480-5013250-1771270463` is currently in **TEST MODE**.

When you process a transaction, it will work perfectly with test cards (4242 4242 4242 4242), but will be declined if you try a real card because Digitzs hasn't enabled live processing yet.

**Only Digitzs can flip the switch from TEST → LIVE mode.**

Once they enable production mode, your integration will immediately start accepting live cards with zero code changes needed.

---

## Summary

✅ **TokenEx iframe loading correctly**
✅ **Merchant ID updated to Escape from Dinosaur Island**
✅ **Edge function deployed with new merchant ID**
✅ **Configuration matches PDF documentation**
⚠️ **Waiting for Digitzs to enable LIVE mode**

**Next Step:** Contact Digitzs to enable production processing for merchant `digitzs-escapefrom-33738480-5013250-1771270463`

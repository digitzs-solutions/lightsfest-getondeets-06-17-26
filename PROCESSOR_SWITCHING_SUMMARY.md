# Processor Switching Architecture: Quick Reference

## The Golden Rule

**NEVER go directly from one processor to another.**

All processor switches flow through the TokenEx hub:

```
❌ WRONG: Digitzs → Stripe
✅ CORRECT: Digitzs → TokenEx Vault → Stripe
```

---

## The Circular Flow

### Every Transaction (Regardless of Processor)

```
Customer Card Entry
       ↓
TokenEx Encrypt (device-level)
       ↓
Kount 360 Pre-Auth Scan
       ↓
TokenEx Decrypt & Route to Processor
       ↓
Processor Authorize (Digitzs/Stripe/NMI)
       ↓
TokenEx Vault (store token)
       ↓
Your App (store vault token ID)
```

### Switching Processors (Same Vaulted Token)

```
Retrieve vaulted token from database
       ↓
Send to TokenEx with new route parameter
       ↓
Kount 360 Re-Scan
       ↓
TokenEx routes to NEW processor
       ↓
New processor authorizes
       ↓
TokenEx updates vault (SAME token)
       ↓
Your App records new transaction
```

---

## Key Concepts

### 1. TokenEx Vault Token is Processor-Agnostic

```typescript
// Transaction 1: Use Digitzs
{
  payment_token: "tx_abc123",
  processor_used: "digitzs",
  transaction_id: "dig_xyz789"
}

// Transaction 2: Switch to Stripe (SAME token!)
{
  payment_token: "tx_abc123",  // ← Same token
  processor_used: "stripe",     // ← Different processor
  transaction_id: "ch_stripe123"
}
```

### 2. TokenEx Always in the Middle

Every authorization request goes through TokenEx:
- **Initial charge:** TokenEx encrypts → Kount scans → TokenEx routes → Processor
- **Recurring charge:** TokenEx retrieves → Kount scans → TokenEx routes → Processor
- **Processor switch:** TokenEx retrieves → Kount scans → TokenEx routes to NEW processor

### 3. Your App Never Knows the Difference

```typescript
// This code NEVER changes, regardless of processor
const result = await supabase.functions.invoke('payvia-process', {
  body: { token, amount, kountSessionId }
});

// The edge function handles routing internally
// Merchant switches processors by changing ONE config variable
```

---

## Implementation Status

### Path 1: Digitzs v2 (LIVE)
- **Status:** ✅ Production ready
- **Flow:** TokenEx → Kount → TokenEx → Digitzs v2 → ProPay → TokenEx Vault
- **Edge Function:** `payvia-process`
- **Credentials:** Payvia API key + App key + Digitzs MID

### Path 2: Stripe TPS (READY TO IMPLEMENT)
- **Status:** 🚧 Not yet built
- **Flow:** TokenEx → Kount → TokenEx → Stripe API → TokenEx Vault
- **Edge Function:** `tokenex-stripe-tps` (needs creation)
- **Credentials:** TokenEx ID + API key + Stripe secret key

### Path 3: NMI Direct (BACKUP ONLY)
- **Status:** ⚠️ Does NOT use TokenEx vault
- **Flow:** NMI Collect.js → Kount → NMI Gateway → ProPay → NMI Token Vault
- **Edge Function:** `digitzs-direct` (misleading name)
- **Issue:** Tokens are NMI-specific, NOT portable to other processors

---

## To Enable Processor Switching

### Step 1: Create Stripe TPS Edge Function

```typescript
// supabase/functions/tokenex-stripe-tps/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { token, amount, kountSessionId } = await req.json();

  // Call TokenEx Payment Services (TPS) Stripe endpoint
  const response = await fetch('https://api.tokenex.com/TPS/Stripe/charge', {
    method: 'POST',
    headers: {
      'TX-TokenExID': Deno.env.get('TOKENEX_ID'),
      'TX-APIKey': Deno.env.get('TOKENEX_API_KEY'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      amount,
      currency: 'usd',
      stripeAccount: Deno.env.get('STRIPE_SECRET_KEY'),
    }),
  });

  const result = await response.json();
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Step 2: Add Processor Selection to Database

```sql
-- Add processor column to events table
ALTER TABLE events ADD COLUMN preferred_processor TEXT DEFAULT 'digitzs';
ALTER TABLE events ADD COLUMN backup_processor TEXT DEFAULT 'stripe';

-- Add processor routing to registrations table
ALTER TABLE registrations ADD COLUMN processor_used TEXT;
ALTER TABLE registrations ADD COLUMN processor_transaction_id TEXT;
```

### Step 3: Update payvia-process to Support Routing

```typescript
// Determine which processor to use
const event = await getEventDetails(eventId);
const processor = event.preferred_processor || 'digitzs';

if (processor === 'digitzs') {
  // Existing Digitzs v2 path
  const result = await invokeDigitzsPath(token, amount);
} else if (processor === 'stripe') {
  // New Stripe TPS path
  const result = await invokeStripePath(token, amount);
}

// Store which processor was used
await storeTransaction({
  payment_token: token,
  processor_used: processor,
  processor_transaction_id: result.transactionId,
});
```

### Step 4: Build Admin UI for Processor Selection

```typescript
// Allow merchants to choose processor per event
<select value={preferredProcessor} onChange={handleProcessorChange}>
  <option value="digitzs">Digitzs v2 (ProPay)</option>
  <option value="stripe">Stripe</option>
  <option value="nmi">NMI Direct</option>
</select>
```

---

## Merchant Benefits

### Speed
- Switch processors in 60 seconds (not 3-6 months)
- No code changes to checkout
- No customer re-entry of cards

### Cost Optimization
- A/B test processors to find lowest decline rates
- Route transactions based on card type (AMEX → Stripe, Visa → Digitzs)
- Switch to processor with better rates instantly

### Redundancy
- If Digitzs goes down → Auto-failover to Stripe
- No downtime, no lost sales

### Flexibility
- Add PayPal, Apple Pay, Google Pay without touching checkout code
- TokenEx handles all payment method vaulting

---

## Visual: The Hub Architecture

```
                    ┌─────────────────┐
                    │  TokenEx Vault  │
                    │  (Central Hub)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
         Digitzs v2      Stripe TPS    NMI Direct
              │              │              │
              ▼              ▼              ▼
         ProPay MID     Stripe MID    Raw ProPay
         33595002        acct_xyz       33595002
```

**All paths return to TokenEx Vault for token storage.**

---

## For Investors: Why This Matters

### Problem Solved
Merchants are locked to processors because tokens are processor-specific. Switching means rebuilding checkout, migrating customers, re-integrating with software platforms.

### Payvia Solution
TokenEx vault tokens are processor-agnostic. Switch processors by changing one config variable. No code changes, no customer migration, no platform re-integration.

### Market Impact
- **Event ticketing:** Switch from Stripe to NMI without TicketSocket knowing
- **Restaurants:** Switch from Square's processor to cheaper option without changing POS
- **E-commerce:** A/B test processors to optimize approval rates and fees

### Revenue Impact
Merchants stay with Payvia forever because switching away means losing processor flexibility. **Lock-in through value, not contracts.**

---

## Documents Reference

1. **[TOKENEX_HUB_ARCHITECTURE.md](./TOKENEX_HUB_ARCHITECTURE.md)** - Deep dive into circular flow
2. **[INTEGRATION_PATHS.md](./INTEGRATION_PATHS.md)** - All three processor paths explained
3. **[PAYVIA_INVESTOR_ONE_PAGER.md](./PAYVIA_INVESTOR_ONE_PAGER.md)** - Business case and financials
4. **[KOUNT_360_INTEGRATION.md](./KOUNT_360_INTEGRATION.md)** - Fraud prevention flow

---

**Status:** Architecture finalized, Digitzs v2 live, Stripe TPS ready to implement
**Last Updated:** March 30, 2026

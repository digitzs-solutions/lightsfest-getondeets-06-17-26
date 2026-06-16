# TokenEx Hub Architecture: The Circular Flow

## Core Principle: TokenEx is ALWAYS the Hub

Every payment transaction, regardless of processor, follows the same circular pattern through TokenEx.

---

## The Complete Flow (Step by Step)

### Initial Transaction: Customer Enters Card

```
Step 1: Card Entry
┌──────────────────────────────────────────┐
│  Customer enters card in TokenEx iframe  │
│  (Never touches your server)             │
└──────────────┬───────────────────────────┘
               │
               ▼
Step 2: TokenEx Encrypts (Device-Level)
┌──────────────────────────────────────────┐
│  Triple-hash encryption at browser level │
│  Result: Token (e.g., 6x4d7f8g...)       │
└──────────────┬───────────────────────────┘
               │
               ▼
Step 3: Kount 360 Pre-Authorization Scan
┌──────────────────────────────────────────┐
│  Device fingerprint + IP geolocation     │
│  Browser behavior + risk scoring         │
│  Result: Risk Score (0-100)              │
└──────────────┬───────────────────────────┘
               │
               ▼ (If risk score < 40, proceed)
Step 4: TokenEx Decrypts for Processor
┌──────────────────────────────────────────┐
│  TokenEx retrieves actual card BIN       │
│  Sends to processor based on route:      │
│    - Route: "digitzs" → Digitzs v2 API   │
│    - Route: "stripe" → Stripe TPS        │
│    - Route: "nmi" → NMI Direct           │
└──────────────┬───────────────────────────┘
               │
               ▼
Step 5: Processor Authorizes
┌──────────────────────────────────────────┐
│  Processor (ProPay/Stripe/NMI) checks:   │
│    - Card valid?                         │
│    - Funds available?                    │
│    - AVS match?                          │
│  Result: Approved/Declined               │
└──────────────┬───────────────────────────┘
               │
               ▼
Step 6: TokenEx Vaults Token
┌──────────────────────────────────────────┐
│  TokenEx stores card vault token         │
│  Token ID: tx_abc123...                  │
│  (This token works with ANY processor)   │
└──────────────┬───────────────────────────┘
               │
               ▼
Step 7: Your App Stores Transaction
┌──────────────────────────────────────────┐
│  Save to Supabase registrations table:   │
│    - payment_token: tx_abc123            │
│    - processor_used: "digitzs"           │
│    - transaction_id: xyz789              │
│    - kount_session_id: sess456           │
└──────────────────────────────────────────┘
```

---

## Subsequent Transaction: Charging Same Customer

```
Step 1: Retrieve Vaulted Token from Database
┌──────────────────────────────────────────┐
│  SELECT payment_token FROM registrations │
│  WHERE customer_id = ?                   │
│  Result: tx_abc123                       │
└──────────────┬───────────────────────────┘
               │
               ▼
Step 2: Send to TokenEx with New Route
┌──────────────────────────────────────────┐
│  POST to TokenEx Gateway API             │
│  Body: {                                 │
│    token: "tx_abc123",                   │
│    route: "stripe",  ← SWITCHED!         │
│    amount: 5000,                         │
│    merchant_id: "..."                    │
│  }                                       │
└──────────────┬───────────────────────────┘
               │
               ▼
Step 3: Kount Re-Scans (Device Fingerprint Updated)
┌──────────────────────────────────────────┐
│  Kount checks:                           │
│    - Same device?                        │
│    - Same IP range?                      │
│    - Behavioral patterns match?          │
│  Result: Risk Score (updated)            │
└──────────────┬───────────────────────────┘
               │
               ▼
Step 4: TokenEx Routes to Stripe (New Processor!)
┌──────────────────────────────────────────┐
│  TokenEx retrieves card from vault       │
│  Sends to Stripe TPS API                 │
│  (Customer doesn't re-enter card)        │
└──────────────┬───────────────────────────┘
               │
               ▼
Step 5: Stripe Authorizes
┌──────────────────────────────────────────┐
│  Stripe processes authorization          │
│  Result: Approved with Stripe txn ID     │
└──────────────┬───────────────────────────┘
               │
               ▼
Step 6: TokenEx Updates Vault (Same Token!)
┌──────────────────────────────────────────┐
│  Token tx_abc123 still valid             │
│  No new token needed                     │
└──────────────┬───────────────────────────┘
               │
               ▼
Step 7: Your App Records New Transaction
┌──────────────────────────────────────────┐
│  INSERT INTO registrations:              │
│    - payment_token: tx_abc123 (SAME!)    │
│    - processor_used: "stripe" (CHANGED)  │
│    - transaction_id: stripe_xyz          │
└──────────────────────────────────────────┘
```

---

## Why This Architecture is Revolutionary

### 1. Processor-Agnostic Tokens

**Traditional approach:**
```
❌ Customer enters card → Stripe creates token → Locked to Stripe forever
❌ Want to switch to ProPay? → Rebuild checkout, get new tokens, migrate data
```

**Payvia approach:**
```
✅ Customer enters card → TokenEx creates token → Use with ANY processor
✅ Want to switch to Stripe? → Change route parameter, done in 60 seconds
```

### 2. A/B Testing Processors

```javascript
// Example: Route based on risk score
const processor = kountScore < 20 ? 'stripe' : 'digitzs';

// Example: Route based on transaction amount
const processor = amount > 100000 ? 'stripe' : 'digitzs';

// Example: Route based on card type
const processor = cardType === 'amex' ? 'stripe' : 'digitzs';
```

**Merchants can:**
- Test which processor has lower decline rates
- Send high-risk transactions to one processor, low-risk to another
- Optimize for lowest fees per transaction type
- Switch processors if one goes down (redundancy)

### 3. Zero Checkout Changes

```typescript
// Checkout component (NEVER changes)
<TokenExIframe
  tokenExId="YourTokenExID"
  onTokenize={handleTokenReceived}
/>

// Backend edge function (THIS is what changes)
const processor = merchant.preferred_processor; // "digitzs" or "stripe"
const result = await tokenex.authorize({
  token: paymentToken,
  route: processor, // ← Only line that changes
  amount: totalAmount
});
```

**Result:** Merchant switches processors without:
- ❌ Changing checkout UI
- ❌ Updating iframe code
- ❌ Migrating customer tokens
- ❌ Re-testing PCI compliance
- ❌ Notifying software platform (TicketSocket/Square/Toast)

---

## Visual: The Hub-and-Spoke Model

```
                    ┌─────────────────────┐
                    │   YOUR APP          │
                    │  (Frontend + DB)    │
                    └──────────┬──────────┘
                               │
                               │ Stores vault token
                               │ (processor-agnostic)
                               │
                               ▼
                    ┌─────────────────────┐
                    │  TokenEx Vault      │
                    │  (Central Hub)      │
                    │                     │
                    │  Token: tx_abc123   │
                    │  Card: ****1234     │
                    │  Expires: 12/27     │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         │ Route: "digitzs"    │ Route: "stripe"    │ Route: "nmi"
         │                     │                     │
         ▼                     ▼                     ▼
   ┌──────────┐          ┌──────────┐          ┌──────────┐
   │ Kount 360│          │ Kount 360│          │ Kount 360│
   │  Scan    │          │  Scan    │          │  Scan    │
   └────┬─────┘          └────┬─────┘          └────┬─────┘
        │                     │                     │
        ▼                     ▼                     ▼
   ┌──────────┐          ┌──────────┐          ┌──────────┐
   │ Digitzs  │          │  Stripe  │          │   NMI    │
   │   v2     │          │   TPS    │          │  Direct  │
   └────┬─────┘          └────┬─────┘          └────┬─────┘
        │                     │                     │
        ▼                     ▼                     ▼
   ┌──────────┐          ┌──────────┐          ┌──────────┐
   │  ProPay  │          │  Stripe  │          │ Raw MID  │
   │   MID    │          │   MID    │          │  ProPay  │
   └──────────┘          └──────────┘          └──────────┘
```

**Key Insight:** The hub (TokenEx) never changes. Only the spokes (processors) change based on routing logic.

---

## Implementation in Code

### Frontend (Never Changes)

```typescript
// src/components/lights/MultiStepCheckout.tsx
const handleTokenReceived = async (token: string, kountSessionId: string) => {
  // Token is processor-agnostic
  // Your app doesn't need to know which processor will be used
  const response = await supabase.functions.invoke('payvia-process', {
    body: {
      token,
      kountSessionId,
      amount: totalAmount,
      // Processor selection happens server-side
    }
  });
};
```

### Backend (This is where routing happens)

```typescript
// supabase/functions/payvia-process/index.ts
const processor = determineProcessor(kountScore, amount, merchantConfig);

if (processor === 'digitzs') {
  // Route through Digitzs v2 API
  const authToken = await getPayviaAuthToken();
  const result = await fetch(`${PAYVIA_API_URL}/v4/payments`, {
    headers: { Authorization: `Bearer ${authToken}` },
    body: JSON.stringify({
      token,
      merchant_id: DIGITZS_MERCHANT_ID,
      amount,
    })
  });
} else if (processor === 'stripe') {
  // Route through Stripe TPS
  const result = await fetch(`https://api.tokenex.com/TPS/Stripe/charge`, {
    headers: { 'TX-TokenExID': TOKENEX_ID, 'TX-APIKey': TOKENEX_API_KEY },
    body: JSON.stringify({
      token,
      amount,
      stripeAccount: STRIPE_ACCOUNT_ID,
    })
  });
}

// Both paths return the SAME vault token format
return { success: true, vaultToken: token };
```

---

## Competitive Advantage Summary

| Capability | Traditional (Stripe/Square) | Payvia (TokenEx Hub) |
|------------|----------------------------|----------------------|
| Switch processors | ❌ Requires full rebuild | ✅ 60 seconds (config change) |
| Token portability | ❌ Processor-locked | ✅ Works across all processors |
| A/B test processors | ❌ Not possible | ✅ Built-in routing logic |
| Processor downtime failover | ❌ No redundancy | ✅ Auto-failover to backup |
| Add new processor | ❌ 3-6 months integration | ✅ 24 hours (TokenEx does it) |
| Merchant code changes | ❌ Every processor switch | ✅ Zero (server-side routing) |
| Customer re-entry of cards | ❌ Yes (new tokens needed) | ✅ No (vault token reused) |
| PCI compliance re-audit | ❌ Yes (new iframe/form) | ✅ No (TokenEx stays same) |

---

## Real-World Example: Lights Festival

### Current Setup
- **Processor:** Digitzs v2 (wrapping ProPay MID 33595002)
- **Route:** TokenEx → Kount → Digitzs → ProPay
- **Vault Token:** Stored in Supabase `registrations.payment_token`

### Scenario: Switch to Stripe (Better Rates)

**Step 1:** Add Stripe credentials to edge function environment
```bash
STRIPE_SECRET_KEY=sk_live_xyz123
STRIPE_PUBLISHABLE_KEY=pk_live_abc456
```

**Step 2:** Update routing logic (30 seconds)
```typescript
// Change ONE line in payvia-process edge function
const processor = 'stripe'; // Was: 'digitzs'
```

**Step 3:** Redeploy edge function (30 seconds)
```bash
supabase functions deploy payvia-process
```

**Step 4:** Done!
- ✅ Next transaction uses Stripe
- ✅ Same TokenEx vault tokens work
- ✅ Same checkout UI
- ✅ Same PCI compliance level
- ✅ TicketSocket has no idea anything changed

**Total time:** 60 seconds
**Code changes:** 1 line
**Customer impact:** Zero

---

## Future: Intelligent Processor Routing

```typescript
// Smart routing based on multiple factors
async function determineProcessor(transaction: Transaction): Promise<string> {
  const { kountScore, amount, cardType, customerHistory } = transaction;

  // High-risk? Use processor with better fraud tools
  if (kountScore > 50) return 'stripe';

  // Large transaction? Use processor with higher limits
  if (amount > 100000) return 'stripe';

  // AMEX? Use processor with better AMEX rates
  if (cardType === 'amex') return 'stripe';

  // Repeat customer with good history? Use cheapest processor
  if (customerHistory.transactions > 5 && customerHistory.chargebacks === 0) {
    return 'digitzs'; // Lower fees
  }

  // Default
  return 'digitzs';
}
```

**This is the future of payment processing:** Intelligent routing that optimizes for cost, risk, and approval rates—all invisible to the merchant and customer.

---

**Last Updated:** March 30, 2026
**Status:** Architecture finalized, Digitzs v2 path live, Stripe TPS ready to implement

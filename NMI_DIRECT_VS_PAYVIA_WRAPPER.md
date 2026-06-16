# NMI Direct vs Payvia Wrapper: Integration Comparison

## The Two Integration Paths

### Path 1: Payvia v4 Wrapper (Recommended)
**Flow:** TokenEx iframe → Your App → Payvia v4 API → Digitzs MID → ProPay/NMI/Stripe

### Path 2: NMI White Label Direct (Not recommended with TokenEx)
**Flow:** TokenEx iframe → Your App → NMI White Label → ProPay/NMI

## Why Payvia Wrapper Exists

Payvia v4 was created to:
1. **Simplify multi-processor support** - Single API for 200+ processors
2. **Enable embedded checkout** - Consistent interface for ondeets.ai subdomains
3. **Abstract processor complexity** - Merchants don't need processor-specific credentials
4. **Enable MID-based routing** - Same credentials, different merchants/processors

## Technical Comparison

| Feature | Payvia v4 Wrapper | NMI Direct |
|---------|------------------|------------|
| **Endpoint** | `api.payvia.staging.ondeets.ai/v4` | `digitzs.transactiongateway.com/api` |
| **Credentials** | App Key + API Key (universal) | Security Key (per merchant) |
| **Merchant ID** | Digitzs format with processor routing | Raw ProPay MID + cert + terminal |
| **TokenEx Compatible** | ✅ Yes (designed for it) | ⚠️ Blocked by TokenEx iframe |
| **Multi-Processor** | ✅ Yes (ProPay, NMI, Stripe, etc.) | ❌ No (NMI/ProPay only) |
| **Auth Method** | Bearer token from `/auth/token` | Security key in POST params |
| **API Format** | JSON:API spec | NMI Query Gateway |
| **Response Format** | Structured JSON with status | Transaction response XML/JSON |
| **Error Handling** | HTTP status + structured errors | Response codes in body |

## Credential Management

### Payvia v4 (Single Set for All)
```bash
# One set of credentials works for ALL merchants/processors
API_KEY=pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2
APP_KEY=HTxKp4jh1cSIprscR81zXt6EtsOup1wNf8HPNLr5vTNWMAUloj0i7yEhVmIxZrck

# Routing determined by Merchant ID:
ticketso-clevergroup-33595002-4398786-1724692895  → ProPay
digitzs-stripe-test-718643500-3230807-1732171363  → Stripe
digitzs-nmi-test-718643500-3230807-1732171363     → NMI
```

### NMI Direct (Per Merchant)
```bash
# Different security key for each merchant account
SECURITY_KEY=r5CwD8t23mHuY78CvznA8KF52j282HwW  # Clevergroup Shopify
# Plus need: ProPay MID, cert string, terminal ID, etc.
```

## Why TokenEx Blocks NMI Direct

TokenEx iframe implements **Content Security Policy (CSP)** and **CORS restrictions** that:
1. Only allow TokenEx-approved domains
2. Block direct calls to `*.transactiongateway.com`
3. Prevent merchant from accessing raw card data

**Workaround:** Use Payvia as approved proxy, since ondeets.ai is whitelisted.

## MID Format Deep Dive

### Digitzs MID Structure
```
{provider}-{merchant}-{ppMID}-{config}-{timestamp}
```

**Examples:**

```bash
# TicketSocket → ProPay
ticketso-clevergroup-33595002-4398786-1724692895
├─ ticketso: Provider (TicketSocket)
├─ clevergroup: Merchant name
├─ 33595002: ProPay MID
├─ 4398786: Config ID
└─ 1724692895: Creation timestamp

# Digitzs Test → Generic
digitzs-test-718643500-3230807-1732171363
├─ digitzs: Provider
├─ test: Environment
├─ 718643500: Test account ID
├─ 3230807: Config ID
└─ 1732171363: Creation timestamp

# Digitzs Stripe Test
digitzs-stripe-test-718643500-3230807-1732171363
├─ digitzs: Provider
├─ stripe: Processor type
├─ test: Environment
├─ 718643500: Test account ID
├─ 3230807: Config ID
└─ 1732171363: Creation timestamp
```

### NMI Raw MID Structure
```bash
# ProPay Merchant Configuration
MID: 33595002
Cert String: (long alphanumeric from ProPay portal)
Terminal ID: (from ProPay)
Security Key: r5CwD8t23mHuY78CvznA8KF52j282HwW (from NMI portal)
```

## API Request Comparison

### Payvia v4 Auth + Payment

```javascript
// Step 1: Get auth token
const authRes = await fetch('https://api.payvia.staging.ondeets.ai/v4/auth/token', {
  method: 'POST',
  headers: {
    'x-api-key': 'pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    data: {
      type: 'auth',
      attributes: { appKey: 'HTxKp4jh1cSIprscR81zXt6EtsOup1wNf8HPNLr5vTNWMAUloj0i7yEhVmIxZrck' }
    }
  })
});

const { data: { attributes: { app_token } } } = await authRes.json();

// Step 2: Process payment
const paymentRes = await fetch('https://api.payvia.staging.ondeets.ai/v4/payments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${app_token}`,
    'x-api-key': 'pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    data: {
      type: 'payments',
      attributes: {
        merchantId: 'ticketso-clevergroup-33595002-4398786-1724692895',
        amount: 50.00,
        currency: 'USD',
        paymentMethodData: {
          type: 'card',
          token: '424242cO44OC4242',
          expirationMonth: '12',
          expirationYear: '2029'
        },
        customerInfo: { /* ... */ }
      }
    }
  })
});
```

### NMI Direct (Blocked by TokenEx)

```javascript
// Single-step POST (would be blocked by TokenEx CSP)
const paymentRes = await fetch('https://digitzs.transactiongateway.com/api/transact.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    security_key: 'r5CwD8t23mHuY78CvznA8KF52j282HwW',
    type: 'sale',
    amount: '50.00',
    currency: 'USD',
    ccnumber: '424242cO44OC4242', // TokenEx token
    ccexp: '1229',
    tokenex: 'true',
    // ProPay specific:
    merchant_defined_field_1: '33595002', // ProPay MID
    merchant_defined_field_2: 'cert_string_here',
    merchant_defined_field_3: 'terminal_id_here',
    // Customer info...
  })
});
```

## When to Use Each Path

### Use Payvia v4 When:
✅ Integrating with TokenEx iframe
✅ Need to support multiple processors
✅ Want simplified credential management
✅ Building embedded checkout for ondeets.ai
✅ Need clean JSON:API responses

### Use NMI Direct When:
✅ NOT using TokenEx iframe
✅ Only processing through NMI/ProPay
✅ Have direct NMI White Label access
✅ Need advanced NMI-specific features
✅ Building custom payment form (not iframe)

## Migration Scenarios

### Scenario 1: TokenEx → Payvia (Current TicketSocket)
```
Status: ✅ Recommended
Reason: TokenEx iframe requires approved domain
Solution: Use Payvia v4 as proxy
```

### Scenario 2: Custom Form → NMI Direct
```
Status: ✅ Acceptable
Reason: No TokenEx CSP restrictions
Solution: Use NMI White Label directly
```

### Scenario 3: TokenEx → NMI Direct
```
Status: ❌ Not Possible
Reason: TokenEx CSP blocks *.transactiongateway.com
Solution: Must use Payvia v4 wrapper
```

## Production Deployment Strategy

### For TicketSocket Integration (ondeets.ai)

**Step 1:** Test with Payvia staging
```bash
API_URL=https://api.payvia.staging.ondeets.ai
MERCHANT_ID=digitzs-test-718643500-3230807-1732171363
```

**Step 2:** Verify with ProPay test MID (real cards)
```bash
MERCHANT_ID=digitzs-paolomercha-718714640-3388619-1767883025
```

**Step 3:** Deploy to production
```bash
API_URL=https://api.payvia.ondeets.ai
MERCHANT_ID=ticketso-clevergroup-33595002-4398786-1724692895
```

### For Direct Integration (No TokenEx)

**Step 1:** Get NMI White Label credentials
```bash
SECURITY_KEY=r5CwD8t23mHuY78CvznA8KF52j282HwW
GATEWAY_URL=https://digitzs.transactiongateway.com/api/transact.php
```

**Step 2:** Get ProPay merchant details
```bash
PROPAY_MID=33595002
CERT_STRING=from_propay_portal
TERMINAL_ID=from_propay_portal
```

**Step 3:** Test and deploy
```bash
# Use NMI API directly
```

## Summary

| Requirement | Recommended Path |
|-------------|------------------|
| TokenEx iframe + TicketSocket | **Payvia v4** |
| Custom form + Direct NMI | **NMI Direct** |
| Multiple processors | **Payvia v4** |
| Embedded checkout | **Payvia v4** |
| Advanced NMI features | **NMI Direct** |
| Simplified credentials | **Payvia v4** |

## References

- Payvia Docs: https://payvia-65a748ab.mintlify.app/
- Jira MID Config: `docs/Jira_Payvia_Change_Processors_Configured+MIDs+for+Different+Processors..doc`
- NMI Setup: `NMI_COLLECT_SETUP.md`
- TokenEx Setup: `TOKENEX_SETUP.md`

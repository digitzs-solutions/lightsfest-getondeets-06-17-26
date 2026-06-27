# Production Environment Variables for Vercel

## Overview: End-to-End Transaction Flow

```
User (getondeets.ai)
  |
  |-- [1] PayVia Hosted Checkout iframe (checkout.digitzs.com)
  |       |-- TokenEx iFrame (card tokenization)
  |       |-- Returns token via postMessage (digitzs:token-created)
  |
  |-- [2] POST /api/payvia-process (Vercel Serverless)
  |       |-- Authenticates with PayVia v4 API
  |       |-- Charges card via NMI gateway
  |       |-- Transaction appears in MyValet/ProPay/Digitzs dashboard
  |
  |-- [3] POST /api/ticketsocket-proxy?action=create-order (Vercel Serverless)
  |       |-- Authenticates with TicketSocket v1 API
  |       |-- Creates order with detachPaymentMethod=true (no re-charge)
  |       |-- Order appears in CleverGroup TS Admin
```

---

## REQUIRED Vercel Environment Variables

All variables below must be set in Vercel Dashboard > Project Settings > Environment Variables.
Set for **Production**, **Preview**, and **Development** environments.

### PayVia (Payment Processing via Digitzs/NMI)

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_PAYVIA_MERCHANT_ID` | `ticketso-clevergroup-33595002-4398786-1724692895` | Frontend: identifies merchant to PayVia hosted checkout iframe |
| `VITE_PAYVIA_ENVIRONMENT` | `production` | Frontend: selects `checkout.digitzs.com` (not staging) |
| `PAYVIA_API_KEY` | `pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2` | Backend: x-api-key header for PayVia v4 auth |
| `PAYVIA_APP_KEY` | `HTxKp4jh1cSIprscR81zXt6EtsOup1wNf8HPNLr5vTNWMAUloj0i7yEhVmIxZrck` | Backend: generates app_token via /v4/auth/token |
| `PAYVIA_MERCHANT_ID` | `ticketso-clevergroup-33595002-4398786-1724692895` | Backend: identifies merchant in /v4/payments request |
| `PAYVIA_ENVIRONMENT` | `production` | Backend: selects `api.payvia.ondeets.ai` (not staging) |

### TicketSocket / TSCheckout (Order Management)

| Variable | Value | Purpose |
|----------|-------|---------|
| `TS_USERNAME` | `Laura@digitzs.com` | Backend: TicketSocket API authentication |
| `TS_PASSWORD` | `DFRocks2026!` | Backend: TicketSocket API authentication |
| `TS_PUBLIC_KEY` | `ad691a59acd46cc3df62320c89706ba9-835088` | Backend: public key for /tokens endpoint |
| `TS_PUBLIC_KEY_SLUG` | `clevergroup` | Backend: org slug for /tokens endpoint |
| `TS_API_URL` | `https://clevergroup.tscheckout.com` | Backend: base URL for TS API (no trailing /api/v1) |

### Optional

| Variable | Value | Purpose |
|----------|-------|---------|
| `TS_ORDER_PAYMENT_METHOD` | `credit` | Backend: payment method sent to TS (default: credit) |

---

## API Endpoints Used

### PayVia v4 (Production)
- **Auth**: `POST https://api.payvia.ondeets.ai/v4/auth/token`
- **Payment**: `POST https://api.payvia.ondeets.ai/v4/payments`

### TicketSocket v1 (Production)
- **Auth**: `POST https://clevergroup.tscheckout.com/api/v1/tokens`
- **Events**: `GET https://clevergroup.tscheckout.com/api/v1/events`
- **Ticket Types**: `GET https://clevergroup.tscheckout.com/api/v1/events/{id}/ticket-types`
- **Create Order**: `POST https://clevergroup.tscheckout.com/api/v1/orders`
- **Describe Order**: `POST https://clevergroup.tscheckout.com/api/v1/orders/describe`

### PayVia Hosted Checkout (Frontend iframe)
- **Production**: `https://checkout.digitzs.com`
- **Staging**: `https://checkout.staging.digitzs.com`

---

## TokenEx Domain Whitelist (CRITICAL)

The PayVia Hosted Checkout iframe embeds TokenEx for PCI-compliant card capture.
TokenEx validates the **parent page origin** against a whitelist.

**Currently whitelisted domain**: `getondeets.ai`

If the parent page is NOT on the whitelist, the iframe will:
1. Load but never send the `digitzs:ready` postMessage
2. The spinner will spin indefinitely (no card form appears)

**To add a new domain**: Contact TokenEx support or Digitzs to whitelist the domain.

**Domains that WILL NOT work**:
- Bolt preview URLs (*.bolt.new, *.webcontainer.io)
- localhost / 127.0.0.1
- Any domain not explicitly whitelisted

**Domains that WILL work**:
- `thelightfest.getondeets.ai` (current production)
- `getondeets.ai` and subdomains (if whitelisted)
- Any domain you request TokenEx to add

---

## Where Transactions Appear

### MyValet / Digitzs Dashboard (Payment)
- Transactions processed via PayVia appear in the Digitzs merchant dashboard
- Merchant ID: `ticketso-clevergroup-33595002-4398786-1724692895`
- Gateway: NMI (Network Merchants Inc)
- ProPay MID: `33595002`

### CleverGroup TS Admin (Orders/Tickets)
- Orders created via TicketSocket appear in the admin panel
- URL: `https://clevergroup.tscheckout.com/admin` (or TS dashboard)
- Orders use `detachPaymentMethod: true` (payment handled externally)
- Email receipts are sent automatically (`emailReceipt: '1'`)

---

## Vercel Serverless Functions (in /api directory)

| File | Route | Purpose |
|------|-------|---------|
| `api/payvia-process.ts` | `POST /api/payvia-process` | Authenticates with PayVia, charges card |
| `api/ticketsocket-proxy.ts` | `GET/POST /api/ticketsocket-proxy` | Authenticates with TS, manages events/orders |
| `api/tokenex-auth.ts` | `POST /api/tokenex-auth` | (Legacy - not used in current flow) |

---

## Complete Transaction Sequence

```
1. User clicks "Buy Tickets" on getondeets.ai
2. Checkout modal opens: Tickets -> Contact Info -> Payment
3. Payment step loads PayVia iframe (checkout.digitzs.com)
4. TokenEx (inside PayVia iframe) checks parent origin against whitelist
5. If origin is whitelisted: iframe sends "digitzs:ready" postMessage
6. Parent sends "digitzs:init-checkout" with amount, merchantId, styles
7. User enters card in TokenEx secure fields
8. User clicks "Pay" -> TokenEx tokenizes card -> PayVia sends "digitzs:token-created"
9. Frontend receives token, POSTs to /api/payvia-process:
   - PayVia authenticates (x-api-key + appKey -> app_token)
   - PayVia charges card via NMI: POST /v4/payments
   - Response: transactionId, status, amount
   - Transaction NOW visible in MyValet/Digitzs dashboard
10. Frontend POSTs to /api/ticketsocket-proxy?action=create-order:
    - TS authenticates (publicKey + publicKeySlug -> JWT)
    - TS creates order: POST /orders with detachPaymentMethod=true
    - Response: orderId, status
    - Order NOW visible in CleverGroup TS Admin
11. User sees success screen with order confirmation
```

---

## Spinning Wheel Root Cause

The spinning wheel occurs because:
1. The PayVia iframe at `checkout.digitzs.com` loads
2. Inside it, TokenEx checks the parent page's origin
3. If origin is NOT `getondeets.ai`, TokenEx refuses to initialize
4. The `digitzs:ready` message is never sent back
5. The loading spinner overlay never hides

**Fix**: Deploy to `getondeets.ai` (or any TokenEx-whitelisted domain).
There is NO code fix for this — it's a security measure by TokenEx.

---

## Quick Checklist Before Going Live

- [ ] All 11 environment variables set in Vercel dashboard
- [ ] Domain is TokenEx-whitelisted (getondeets.ai)
- [ ] Custom domain configured in Vercel (thelightfest.getondeets.ai)
- [ ] DNS pointing to Vercel (CNAME or A record)
- [ ] Test transaction with $1.00 amount
- [ ] Verify transaction in MyValet/Digitzs dashboard
- [ ] Verify order in CleverGroup TS Admin
- [ ] Verify email receipt delivered to customer

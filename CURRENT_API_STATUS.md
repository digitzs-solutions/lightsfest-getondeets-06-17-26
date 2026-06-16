# Current API Status & Configuration

## The Situation

Ross left and had `ondeets.ai` on his personal Vercel. Tommy is trying to point it back to your Vercel.

## API URLs - Current Status

### PayVia API
- **Staging**: `https://api.payvia.staging.ondeets.ai` ✅ (Working in API tester)
- **Production**: `https://api.payvia.ondeets.ai` ❓ (Getting Forbidden - needs verification)

### Digitzs v2 API (Legacy - What TicketSocket uses)
- **Base URL**: `https://api.digitzs.com/v2`
- **Purpose**: Legacy API that TicketSocket originally integrated with
- **MID Wrapping**: Uses Digitzs MID format that wraps ProPay MID
- **Example MID**: `ticketso-clevergroup-33595002-4398786-1724692895`
  - Wraps ProPay MID: `33595002`

## The Three Integration Paths

### Path 1: PayVia v4 API (Recommended for TokenEx)
```
Frontend → TokenEx iframe → Token → PayVia v4 API → Digitzs MID → ProPay
```

**Credentials (Same for all merchants):**
- API Key: `pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2`
- App Key: `HTxKp4jh1cSIprscR81zXt6EtsOup1wNf8HPNLr5vTNWMAUloj0i7yEhVmIxZrck`

**Endpoints:**
- Auth: `POST /v4/auth/token`
- Payment: `POST /v4/payments`

### Path 2: Digitzs v2 API (Legacy - TicketSocket Original)
```
Frontend → Digitzs v2 API → Digitzs MID → ProPay
```

**Base URL:** `https://api.digitzs.com/v2`

**Credentials:**
- Merchant ID: `ticketso-clevergroup-33595002-4398786-1724692895`
- Security Key: `pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2`

**Notes:**
- This is the OLD way TicketSocket integrated
- They only had to use the Digitzs MID
- Digitzs MID wraps the raw ProPay MID `33595002`
- PayVia Checkout integrated to Digitzs v2 "as if it were another TicketSocket"

### Path 3: TokenEx Transparent Gateway (Current - Most Secure)
```
Frontend → TokenEx iframe → Token → TokenEx Transparent Gateway → ProPay
```

**Key Difference:** Card never touches your server - TokenEx detokenizes and forwards to ProPay directly.

**TokenEx Production Keys:**
- TokenEx ID: Starting with `Y9ir` (you mentioned this works now)
- API Key: (Need to verify you have this)

## Current Environment Variables

From `.env`:
```bash
# Digitzs v2 API (Legacy)
DIGITZS_MERCHANT_ID=ticketso-clevergroup-33595002-4398786-1724692895
DIGITZS_SECURITY_KEY=pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2
DIGITZS_API_URL=https://api.digitzs.com/v2

# TicketSocket API
TICKETSOCKET_API_KEY=ad691a59acd46cc3df62320c89706ba9-835088
TICKETSOCKET_API_URL=https://clevergroup.tscheckout.com/api/v1
```

## What Needs to be Set in Supabase Edge Functions

### For PayVia v4 Integration:
```bash
PAYVIA_API_URL=https://api.payvia.ondeets.ai  # PRODUCTION (not staging)
PAYVIA_API_KEY=pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2
PAYVIA_APP_KEY=HTxKp4jh1cSIprscR81zXt6EtsOup1wNf8HPNLr5vTNWMAUloj0i7yEhVmIxZrck
PAYVIA_MERCHANT_ID=ticketso-clevergroup-33595002-4398786-1724692895
```

### For TokenEx Transparent Gateway:
```bash
TOKENEX_ID=Y9ir... (your production TokenEx ID)
TOKENEX_API_KEY=... (your production TokenEx API key)

# ProPay credentials for gateway routing
PROPAY_ACCOUNT_NUM=33595002
PROPAY_TERMINAL_ID=... (from ProPay portal)
PROPAY_CERT_STR=... (from ProPay portal)
```

### For Digitzs v2 Direct (Legacy fallback):
```bash
DIGITZS_MERCHANT_ID=ticketso-clevergroup-33595002-4398786-1724692895
DIGITZS_SECURITY_KEY=pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2
DIGITZS_API_URL=https://api.digitzs.com/v2
```

## How TicketSocket Originally Worked

1. TicketSocket integrated to **Digitzs v2 API**
2. They only needed the **Digitzs MID**: `ticketso-clevergroup-33595002-4398786-1724692895`
3. This Digitzs MID **wraps** the raw ProPay MID `33595002`
4. Digitzs handles routing to ProPay internally
5. TicketSocket never needed to know about ProPay credentials

## How PayVia Checkout Integrates

PayVia Checkout integrates to Digitzs v2 API **as if it were another TicketSocket client**:
1. Uses the same Digitzs MID format
2. Same Security Key
3. Routes through same endpoint
4. Transparent to the processor

## API Tester Issues

The API Tester currently has:
- Base URL: `https://api.payvia.staging.ondeets.ai` (STAGING)
- Should be: `https://api.payvia.ondeets.ai` (PRODUCTION)

**Note:** Production URL returning "Forbidden" suggests:
- Domain might not be fully configured on Tommy's Vercel
- Or credentials need to be updated for production
- Or production API has different authentication requirements

## Next Steps

1. **Verify Production PayVia URL is working**
   - Test: `curl -I https://api.payvia.ondeets.ai`
   - Should return 200 or 404, not Forbidden

2. **Confirm TokenEx Production Keys**
   - TokenEx ID starting with `Y9ir`
   - TokenEx API Key for production
   - Test TokenEx iframe loads

3. **Update API Tester**
   - Change default to production
   - Add Digitzs v2 API option

4. **Test Each Integration Path**
   - PayVia v4 production
   - TokenEx Transparent Gateway production
   - Digitzs v2 direct (legacy fallback)

## Questions to Answer

1. Is `https://api.payvia.ondeets.ai` actually working? (Getting Forbidden)
2. Do you have the full TokenEx production API key (not just the ID)?
3. Do you have ProPay terminal ID and cert string?
4. Is the Vercel DNS configured correctly for ondeets.ai?

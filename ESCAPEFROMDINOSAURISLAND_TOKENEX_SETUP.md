# Escape From Dinosaur Island - TokenEx Setup

## Project: escapefromdinosaurisland.ondeets.ai

### Key Differences from Lights Festival

1. **TicketSocket API Version**: v2 (not v1)
2. **Digitzs/ProPay MID**: Different wrapped MID configuration
3. **Domain**: escapefromdinosaurisland.ondeets.ai

---

## TokenEx Domain Whitelisting Required

### Production Domain
```
https://escapefromdinosaurisland.ondeets.ai
```
**Status**: ⚠️ **MUST BE WHITELISTED IN TOKENEX**

### Current Error Details
```
Error Type: Invalid Config Object
Expected origin: https://hppsbqucfklrrytfftye.supabase.co
Current origin: https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3-ka1o1yy6--5173--4c73681d.local-credentialless.webcontainer-api.io
```

**What this means:**
- TokenEx is configured for `https://hppsbqucfklrrytfftye.supabase.co`
- Your local dev environment uses a different URL
- Production domain `escapefromdinosaurisland.ondeets.ai` is NOT yet whitelisted

---

## Required Configuration

### 1. TokenEx Settings
- **TokenEx ID**: [To be provided - likely different from Lights Festival]
- **API Key**: [To be provided]
- **Token Scheme**: sixTOKENfour
- **Authentication**: HMAC enabled
- **Whitelisted Domains**:
  - `https://escapefromdinosaurisland.ondeets.ai` (PRODUCTION)
  - `https://hppsbqucfklrrytfftye.supabase.co` (if sharing backend)
  - `http://localhost:5173` (local development)

### 2. TicketSocket v2 API
- **API Version**: v2 (different from Lights Festival)
- **API URL**: [To be provided - likely different endpoint]
- **API Key**: [To be provided]
- **Event Management**: Uses v2 event structure

### 3. Digitzs/ProPay Configuration
- **Merchant ID (MID)**: [Different from Lights Festival]
- **Security Key**: [Different from Lights Festival]
- **API URL**: https://api.digitzs.com/v2
- **Processor**: ProPay (wrapped by Digitzs)

---

## How to Whitelist Domain in TokenEx

### Option 1: TokenEx Portal (Recommended)
1. Login to **TokenEx Portal**: https://portal.tokenex.com
2. Navigate to: **Settings → Allowed Origins**
3. Add the following domains:
   ```
   https://escapefromdinosaurisland.ondeets.ai
   https://hppsbqucfklrrytfftye.supabase.co
   http://localhost:5173
   ```
4. Click **Save**
5. Wait 5 minutes for changes to propagate

### Option 2: Contact TokenEx Support
- **Email**: support@tokenex.com
- **Subject**: "Whitelist Domain for Escape From Dinosaur Island"
- **Message**:
  ```
  Please whitelist the following domains for our TokenEx account:

  Production: https://escapefromdinosaurisland.ondeets.ai
  Backend: https://hppsbqucfklrrytfftye.supabase.co
  Development: http://localhost:5173

  TokenEx ID: [Your TokenEx ID]
  Merchant: Escape From Dinosaur Island / Digitzs
  ```

---

## Environment Variables Needed

Create a separate `.env` section or file for Escape From Dinosaur Island:

```bash
# Escape From Dinosaur Island Configuration

# Domain
VITE_PRODUCTION_URL=https://escapefromdinosaurisland.ondeets.ai

# Supabase (shared or separate)
VITE_SUPABASE_URL=https://hppsbqucfklrrytfftye.supabase.co
VITE_SUPABASE_ANON_KEY=[Your Anon Key]

# TokenEx (Dino Island specific)
VITE_TOKENEX_ID=[Dino Island TokenEx ID]
TOKENEX_ID=[Dino Island TokenEx ID]
TOKENEX_API_KEY=[Dino Island TokenEx API Key]

# TicketSocket v2 API
TICKETSOCKET_API_VERSION=v2
TICKETSOCKET_API_URL=[TicketSocket v2 API URL]
TICKETSOCKET_API_KEY=[TicketSocket v2 API Key]

# Digitzs/ProPay (Dino Island MID)
DIGITZS_MERCHANT_ID=[Dino Island MID]
DIGITZS_SECURITY_KEY=[Dino Island Security Key]
DIGITZS_API_URL=https://api.digitzs.com/v2
```

---

## Testing Checklist

After whitelisting and configuration:

- [ ] Verify TokenEx iframe loads on `escapefromdinosaurisland.ondeets.ai`
- [ ] Test card tokenization with: 4111 1111 1111 1111
- [ ] Confirm transaction processes through correct Digitzs MID
- [ ] Verify TicketSocket v2 API integration
- [ ] Check Kount 360 session tracking
- [ ] Validate payment appears in correct ProPay dashboard
- [ ] Test $1 parking ticket purchase
- [ ] Test all experience packages

---

## Integration Architecture

```
Frontend (escapefromdinosaurisland.ondeets.ai)
    ↓
TokenEx iFrame (secure card capture)
    ↓
Supabase Edge Function (digitzs-propay)
    ↓
Digitzs v2 API (with Dino Island MID)
    ↓
ProPay Processor
    +
Kount 360 Fraud Detection
    +
TicketSocket v2 API (event management)
```

---

## Next Steps

1. **Obtain credentials** for:
   - Dino Island TokenEx ID and API Key
   - Dino Island Digitzs MID and Security Key
   - TicketSocket v2 API credentials

2. **Whitelist domain** in TokenEx portal:
   - `https://escapefromdinosaurisland.ondeets.ai`

3. **Update environment variables** with Dino Island specific values

4. **Test integration** end-to-end with test card

5. **Monitor dashboards**:
   - TokenEx Portal (tokenization events)
   - Digitzs Dashboard (transaction processing)
   - ProPay MyIQ (settlement)
   - TicketSocket (ticket issuance)

---

## Support Contacts

- **TokenEx Support**: support@tokenex.com
- **Digitzs Support**: [Contact info]
- **TicketSocket Support**: [Contact info]
- **ProPay Support**: [Contact info]

---

## Important Notes

- This is a **separate configuration** from Lights Festival
- Uses **different MID** for payment processing
- Uses **TicketSocket v2** (not v1)
- Requires **separate TokenEx whitelisting**
- May need **separate Supabase project** depending on multi-tenancy needs

---

**Created**: 2026-04-06
**Status**: Configuration pending - awaiting credentials and TokenEx whitelisting

# TokenEx Domain Whitelisting Required

## URGENT ACTION NEEDED

TokenEx must whitelist these domains for the Lights Festival checkout to work in production.

---

## Domains to Whitelist

### 1. Current Supabase Deployment
```
https://hppsbqucfklrrytfftye.supabase.co
```
**Status**: Already whitelisted ✅

### 2. Production Domains (Pending Whitelisting)
```
https://getonedeets.ai
https://ondeets.ai
https://payvia.ai
```
**Status**: Needs whitelisting ⚠️

### 3. Any Additional Testing Domains
```
[Add any other domains you're deploying to]
```

---

## How to Whitelist in TokenEx

### Option A: TokenEx Portal (Self-Service)
1. Login to **TokenEx Portal**: https://portal.tokenex.com
2. Navigate to: **Settings → Allowed Origins** or **API Settings → CORS**
3. Add each domain listed above
4. Click **Save**

### Option B: Contact TokenEx Support
If you don't have portal access:
- Email: support@tokenex.com
- Subject: "Add Allowed Origins for Production Deployment"
- Include: Your TokenEx ID and the domain list above

---

## Why This Matters

**Without whitelisting, transactions will fail** because:
1. TokenEx iframe won't load due to CORS restrictions
2. Card tokenization will be blocked at the browser level
3. Users will see errors like "Origin not allowed" or timeouts

**Current Status**:
- ✅ `localhost` works for development
- ✅ `https://hppsbqucfklrrytfftye.supabase.co` is whitelisted
- ⚠️ Any other domain will be blocked

---

## Testing After Whitelisting

Once domains are whitelisted, test the full flow:

1. **Visit your production URL**
2. **Click "Get Your Tickets"**
3. **Fill out the checkout form**
4. **Enter test card**: 4111 1111 1111 1111
5. **Submit transaction**

Expected result:
- ✅ TokenEx iframe loads
- ✅ Card is tokenized
- ✅ Transaction processes
- ✅ Kount session recorded
- ✅ Payment appears in ProPay dashboard

---

## Technical Details

**Integration Type**: TokenEx Transparent Gateway (iframe)
**Token Scheme**: sixTOKENfour
**Authentication**: HMAC enabled
**Fraud Prevention**: Kount 360 enabled
**Payment Processor**: ProPay (via Digitzs v2)

---

## Deployment URLs

Update this section with your actual deployment URLs:

- **Current deployment**: https://hppsbqucfklrrytfftye.supabase.co
- **Production URL**: [To be configured]
- **Staging URL**: [If applicable]

---

## Next Steps

1. ✅ Verify `https://hppsbqucfklrrytfftye.supabase.co` is whitelisted
2. ⚠️ Add any new production domains to TokenEx
3. ⚠️ Test transactions on each whitelisted domain
4. ✅ Monitor TokenEx dashboard for tokenization events
5. ✅ Check ProPay MyIQ for settlement data

---

**Contact**: If you need help with TokenEx configuration, reach out to their support team with your TokenEx ID and merchant account details.

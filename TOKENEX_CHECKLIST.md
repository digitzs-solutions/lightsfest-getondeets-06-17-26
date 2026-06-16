# TokenEx Integration Checklist - "Payment Form Failed to Load" Fix

## Issue Root Cause ✓ FIXED
The HMAC authentication payload was **missing the `origin` parameter**, causing TokenEx to reject the iframe authentication.

**Before:**
```
HMAC-SHA256(tokenExID|timestamp|tokenScheme, secretKey) ❌
```

**After:**
```
HMAC-SHA256(tokenExID|origin|timestamp|tokenScheme, secretKey) ✓
```

---

## Changes Made ✓ DEPLOYED

### 1. Edge Function Updated (`tokenex-auth`)
- ✓ Added `origin` parameter to request payload
- ✓ Added origin validation (returns 400 if missing)
- ✓ Updated HMAC payload to include origin
- ✓ Deployed to production

### 2. Frontend Updated (`MultiStepCheckout.tsx`)
- ✓ Sends `window.location.origin` in auth request
- ✓ Passes origin to iframe configuration
- ✓ Build successful

---

## Critical Configuration Requirements

### ⚠️ STEP 1: Origin Whitelisting (REQUIRED)
You **MUST whitelist your domain** in the TokenEx dashboard or the iframe will still fail:

1. **Login**: https://portal.tokenex.com
2. **Navigate to**: Account Settings → Security Settings → **Allowed Origins**
3. **Add Origins**:
   - Production: Your deployed domain (e.g., `https://yourdomain.com`)
   - Local testing: `http://localhost:5173`
   - Bolt preview: The Bolt preview URL (e.g., `https://sb1-zkexq2pt.bolt.new`)

**Without origin whitelisting, TokenEx will reject all authentication requests.**

---

### ⚠️ STEP 2: Verify Credentials

Check that these secrets are configured in Supabase:

```bash
# Verify using Supabase dashboard or CLI
TOKENEX_ID=3787957743127376
TOKENEX_API_KEY_3=<your-secret-key>
```

**Current Status:**
- ✓ TOKENEX_ID is set (default: 3787957743127376)
- ? TOKENEX_API_KEY_3 needs verification

---

## Testing Steps

### 1. Check Browser Console
Open the payment page and look for these console logs:

**Success indicators:**
```
✓ TokenEx iframe LOADED successfully!
Iframe is now interactive
Setting tokenExReady to true...
```

**Failure indicators:**
```
✗ TokenEx iframe ERROR: [error details]
Payment form error: [message]
```

### 2. Verify Authentication
Check the auth response in console:
```javascript
Auth data received: {
  success: true,
  tokenExID: "3787957743127376",
  authenticationKey: "base64string...",
  timestamp: "20260401120654",
  tokenScheme: "sixTOKENfour"
}
```

### 3. Check Network Tab
Look for the auth request:
```
POST /functions/v1/tokenex-auth
Status: 200 OK
Response: {"success":true,"authenticationKey":"..."}
```

---

## Common Error Messages & Solutions

### Error: "Payment form failed to load"
**Causes:**
1. Origin not whitelisted in TokenEx dashboard → **Whitelist your domain**
2. Invalid TOKENEX_API_KEY_3 → **Verify secret key**
3. CORS issues → **Already fixed in edge function**
4. Network connectivity → **Check browser console**

### Error: "Origin is required"
**Cause:** Frontend not sending origin
**Status:** ✓ Fixed in MultiStepCheckout.tsx

### Error: "TokenEx not configured"
**Cause:** TOKENEX_API_KEY_3 not set in Supabase
**Solution:** Add the secret key via Supabase dashboard

---

## Production Checklist

Before contacting TokenEx support, verify:

- [ ] Edge function `tokenex-auth` is deployed (check Supabase Functions dashboard)
- [ ] Frontend is sending origin in request body
- [ ] Origin is whitelisted in TokenEx portal
- [ ] TOKENEX_ID matches your account (3787957743127376)
- [ ] TOKENEX_API_KEY_3 is set in Supabase secrets
- [ ] Browser console shows no CORS errors
- [ ] Auth endpoint returns 200 with authenticationKey

---

## Technical Documentation

**TokenEx HMAC Spec:**
https://documentation.ixopay.com/modules/docs/tokenex/generating-the-authentication-key

**Required HMAC Format:**
```
Payload: tokenExID|origin|timestamp|tokenScheme
Signature: HMAC-SHA256(payload, clientSecretKey)
AuthKey: Base64(signature)
```

**Origin Format:**
- Must be fully qualified: `https://domain.com`
- Can include port: `https://domain.com:8080`
- Local dev: `http://localhost:5173`
- Must use HTTPS in production

---

## Support Contact

If the issue persists after completing the checklist:

**TokenEx Support:**
- Email: support@tokenex.com
- Portal: https://portal.tokenex.com

**Information to provide:**
- Your TokenEx ID: `3787957743127376`
- Your origin/domain
- Browser console errors
- Network tab showing auth request/response

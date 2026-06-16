# TokenEx Authentication Fix

## Problem
Error logs showed: "Invalid Authentication Key - Not authorized to use this method"

## Root Cause
The checkout component was using the raw API key directly as the `authenticationKey` parameter, but TokenEx requires an HMAC-SHA256 generated authentication key that follows their security specification.

## What Was Fixed

### 1. Updated API Key Configuration
- Updated `.env` to use the correct API key for iframe ID `3787957743127376`
- API Key: `08701447755d46868717e6c02ae72bb7:gvpUv6T5kzSpOuBp:64924550:1961273`
- This key is now paired with the production TokenEx iframe ID

### 2. Fixed Frontend Authentication Flow
**Before:**
```typescript
authenticationKey: import.meta.env.VITE_TOKENEX_API_KEY_1 || ''
```

**After:**
```typescript
// Call edge function to generate proper HMAC authentication key
const authResponse = await fetch('/functions/v1/tokenex-auth', {
  method: 'POST',
  body: JSON.stringify({
    origin: window.location.origin,
    tokenScheme: 'nGUID',
  })
});
const authData = await authResponse.json();
// Use the generated authentication key
authenticationKey: authData.authenticationKey
```

### 3. Updated Edge Function
- Changed default iframe ID from `7320744805319527` to `3787957743127376`
- Updated to use `TOKENEX_API_KEY_1` environment variable
- Changed default token scheme from `sixTOKENfour` to `nGUID`

## How TokenEx Authentication Works

TokenEx requires HMAC-SHA256 authentication following this pattern:

```
HMAC-SHA256(tokenExID|origin|timestamp|tokenScheme, secretKey)
```

The authentication key:
- Must be Base64 encoded
- Uses UTC timestamp in format `yyyyMMddHHmmss`
- Expires after 20 minutes
- Must be generated server-side to keep the secret key secure

## Security Benefits

1. **Secret Key Never Exposed**: The API key stays server-side in Supabase Edge Functions
2. **Time-Limited Keys**: Each authentication key expires in 20 minutes
3. **Origin Validation**: Authentication includes the requesting origin
4. **HMAC Security**: Uses cryptographic hashing to prevent tampering

## Configuration Pairing

| Component | Value |
|-----------|-------|
| TokenEx Iframe ID | `3787957743127376` |
| API Key | `08701447755d46868717e6c02ae72bb7:gvpUv6T5kzSpOuBp:64924550:1961273` |
| Token Scheme | `nGUID` |
| Environment | Production |

## Testing

To verify the fix:
1. Navigate to the Lights Festival checkout
2. Open browser DevTools Network tab
3. Proceed to payment step
4. Look for successful call to `/functions/v1/tokenex-auth`
5. TokenEx iframe should load without authentication errors
6. Test card tokenization with test card: `4242 4242 4242 4242`

## What to Monitor

Check for these in logs:
- ✅ No more "Invalid Authentication Key" errors
- ✅ Successful TokenEx iframe initialization
- ✅ Token generation working properly
- ✅ Payment flow completing successfully

## Documentation Reference

TokenEx HMAC Authentication Specification:
https://documentation.ixopay.com/modules/docs/tokenex/generating-the-authentication-key

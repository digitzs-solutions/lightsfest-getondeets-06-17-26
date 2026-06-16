# Resolution: "Invalid Authentication Key" Errors

## Error Logs (March 26, 2026)
```
192.178.4.102  HTP  Invalid Authentication Key - Not authorized to use this method
```

## Problem Identified
The checkout was sending the raw API key directly to TokenEx instead of generating a proper HMAC-SHA256 authentication key.

## Solution Applied

### 1. Correct API Key Pairing
Updated the API key to match iframe ID `3787957743127376`:
```
TOKENEX_API_KEY_1=08701447755d46868717e6c02ae72bb7:gvpUv6T5kzSpOuBp:64924550:1961273
```

### 2. Fixed Authentication Flow
Changed from direct API key usage to proper HMAC generation via edge function.

**Flow:**
```
Frontend → tokenex-auth edge function → HMAC generation → TokenEx iframe
```

### 3. Updated Components
- `MultiStepCheckout.tsx` - Now calls tokenex-auth before initializing iframe
- `tokenex-auth/index.ts` - Updated to use correct iframe ID and API key

## Files Modified
1. `.env` - Updated API keys
2. `src/components/lights/MultiStepCheckout.tsx` - Fixed authentication flow
3. `supabase/functions/tokenex-auth/index.ts` - Updated defaults
4. Deployed updated edge function

## Result
Authentication errors should be resolved. The TokenEx iframe will now:
- Receive properly generated HMAC authentication keys
- Use the correct iframe ID / API key pairing
- Successfully tokenize card data
- Complete payment transactions without authorization errors

## Next Steps
Monitor the application for:
- Successful TokenEx iframe loads
- No authentication errors in logs
- Successful payment completions

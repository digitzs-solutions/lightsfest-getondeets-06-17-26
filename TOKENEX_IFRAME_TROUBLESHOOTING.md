# TokenEx Iframe Display Troubleshooting

## Issue
Grey fields appearing instead of card input fields with a document/masking tape appearance.

## What Was Changed

### 1. Enhanced Iframe Container Styling
- Changed from fixed `h-[50px]` to flexible `minHeight: '50px'`
- Added `overflow-hidden` to prevent layout issues
- Added loading indicator while iframe initializes

### 2. Improved Iframe Input Styles
Added complete styling to ensure proper display:
```javascript
styles: {
  base: 'font-family: system-ui, -apple-system, sans-serif; padding: 14px; font-size: 16px; color: #1f2937; border: none; width: 100%; box-sizing: border-box;',
  focus: 'outline: none;',
  error: 'color: #ef4444;',
  placeholder: 'color: #9ca3af;',
}
```

### 3. Enhanced Error Logging
Added detailed console logging to track:
- Authentication key generation
- Iframe initialization
- Load events
- Error events
- Validation events
- Tokenization events

## Debugging Steps

### 1. Open Browser DevTools Console
Check for these logs in order:

```
✅ "Calling tokenex-auth edge function"
✅ "Auth response successful"
✅ "Initializing TokenEx with config" (should show tokenExID, timestamp, authKey present)
✅ "Calling iframe.load()..."
✅ "TokenEx iframe instance created and load() called"
✅ "TokenEx iframe loaded successfully"
```

### 2. Check Network Tab
Look for these requests:

1. **POST to tokenex-auth**
   - Status: 200
   - Response should contain: `{ success: true, authenticationKey: "...", timestamp: "..." }`

2. **Request to tokenex.com**
   - TokenEx will load iframe content from their servers
   - Should see successful loads from `htp.tokenex.com`

### 3. Common Issues & Solutions

#### Issue: Grey Box with No Input Field
**Possible Causes:**
- TokenEx script not loaded
- Authentication key invalid
- Iframe initialization failed
- CSS conflict hiding iframe

**Check:**
```javascript
// In console, verify TokenEx loaded:
window.TokenEx !== undefined

// Check if iframe containers exist:
document.getElementById('tokenex-card-number')
document.getElementById('tokenex-cvv')
```

#### Issue: "Document" or "Masking Tape" Appearance
**Possible Causes:**
- Browser security blocking iframe
- CORS or CSP issues
- TokenEx servers not responding
- Incorrect iframe ID / API key pairing

**Solutions:**
1. Check browser console for CORS errors
2. Verify iframe ID `3787957743127376` matches API key
3. Check if TokenEx environment is correct (HTP vs Production)
4. Ensure no ad-blockers or privacy extensions blocking the iframe

#### Issue: Authentication Errors
**Solution:**
- Edge function generates fresh HMAC keys automatically
- Keys expire after 20 minutes
- Check console for auth errors

### 4. Manual Verification

#### Test the Edge Function Directly:
```bash
curl -X POST https://[your-project].supabase.co/functions/v1/tokenex-auth \
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json" \
  -d '{"origin": "http://localhost:5173", "tokenScheme": "nGUID"}'
```

Expected response:
```json
{
  "success": true,
  "authenticationKey": "[base64-string]",
  "tokenExID": "3787957743127376",
  "timestamp": "20260330123456",
  "tokenScheme": "nGUID"
}
```

### 5. Browser Compatibility
TokenEx iframes work on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Known Issues:**
- Some privacy-focused browsers may block third-party iframes
- Check browser console for security/CORS warnings

### 6. Iframe Display Checklist

Check these in DevTools Elements tab:

```html
<!-- Should see something like: -->
<div id="tokenex-card-number" class="...">
  <iframe src="https://htp.tokenex.com/..." style="..."></iframe>
</div>
```

The iframe should:
- Have a source URL from tokenex.com
- Be visible (not display: none)
- Have width/height set
- Be inside the container div

## Next Steps

If issues persist:

1. **Check Console Logs** - Look for any error messages
2. **Verify Environment Variables** - Ensure all TokenEx keys are set
3. **Test Authentication** - Verify tokenex-auth function returns valid keys
4. **Check Network** - Ensure TokenEx servers are reachable
5. **Browser Extensions** - Disable ad-blockers and privacy extensions temporarily

## Environment Configuration

Current setup:
- **Iframe ID**: `3787957743127376`
- **API Key**: Configured in `.env` and Supabase secrets
- **Token Scheme**: `nGUID`
- **Environment**: HTP (Test environment)
- **Script URL**: `https://htp.tokenex.com/Iframe/Iframe-v3.min.js`

## Testing with Test Cards

Once iframe loads properly, test with:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3 digits (e.g., `123`)

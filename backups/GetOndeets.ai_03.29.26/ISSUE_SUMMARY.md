# GetOndeets.ai - TokenEx Integration Issue
**Date:** March 29, 2026
**Issue:** TokenEx iframes not clickable in MultiStepCheckout component

## Problem Description
TokenEx payment form iframes are rendering but not accepting user input (not clickable). The experience field is clickable, but card number and CVV fields are not responding to clicks or focus events.

## Previous Context
- Same issue occurred last Sunday
- Issue resolved temporarily, then TokenEx shut off access
- Assumed TokenEx access was the root cause, but issue persists after access restored

## Current Status
- TokenEx iframes are loading and visible
- Iframes are not accepting clicks or keyboard input
- Only the "experience" field (standard input) is working correctly

## Changes Made (This Session)

### 1. Simplified TokenEx Configuration
**File:** `src/components/lights/MultiStepCheckout.tsx`

Removed potentially interfering CSS properties from iframe config:
- Removed `font-family` specifications
- Removed `pointer-events` and `cursor` from inline styles
- Simplified to minimal style config:
```javascript
styles: {
  base: 'padding: 14px; font-size: 16px; color: #1f2937;',
  focus: '',
  error: 'color: #ef4444;',
  placeholder: 'color: #9ca3af;',
}
```

### 2. Updated Container Styling
Changed iframe containers from:
```jsx
<div
  id="tokenex-card-number"
  className="min-h-[50px] bg-white border border-gray-300 rounded-xl overflow-hidden"
  style={{ pointerEvents: 'auto' }}
/>
```

To:
```jsx
<div
  id="tokenex-card-number"
  className="h-[50px] bg-white border border-gray-300 rounded-xl"
/>
```

### 3. Added Global CSS Rules
**File:** `src/index.css`

Added explicit iframe positioning and interaction rules:
```css
#tokenex-card-number,
#tokenex-cvv {
  position: relative !important;
  z-index: 1 !important;
}

#tokenex-card-number iframe,
#tokenex-cvv iframe {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  border: none !important;
  pointer-events: auto !important;
  cursor: text !important;
}
```

### 4. Added Debug Logging
Added console logging to track TokenEx initialization:
- Initialization config logging
- Load event confirmation
- Error event tracking
- Validation event tracking

## TokenEx Configuration to Check

### In TokenEx Dashboard:
1. **Allowed Domains**
   - Verify current domain is whitelisted
   - Check localhost is allowed for testing
   - Confirm production domain is configured

2. **Iframe Settings**
   - Check for iframe embedding restrictions
   - Verify CORS settings
   - Check for CSP (Content Security Policy) restrictions

3. **API Key Permissions**
   - Confirm authentication key has correct permissions
   - Verify tokenization key is active
   - Check for any rate limiting or throttling

4. **Account Status**
   - Confirm account is active and not suspended
   - Check for any service notifications
   - Verify billing/subscription status

## Technical Details

### Environment Variables Required:
```
VITE_TOKENEX_TOKENIZATION_KEY_1
VITE_TOKENEX_API_KEY_1
```

### TokenEx Integration Flow:
1. Load TokenEx script from CDN
2. Initialize iframe with tokenization key
3. Configure with authentication key
4. Set up event listeners (load, error, validate)
5. Call iframe.load()
6. Iframe should render and accept input

## Next Steps for Debugging

1. **Check Browser Console**
   - Look for "Initializing TokenEx with config"
   - Verify "TokenEx iframe loaded successfully" appears
   - Check for any TokenEx error messages
   - Look for CSP violations or iframe errors

2. **Inspect TokenEx Dashboard**
   - Review allowed domains configuration
   - Check API key status and permissions
   - Look for any account alerts or notifications

3. **Test Different Configurations**
   - Try removing all custom styles
   - Test with TokenEx default configuration
   - Try different iframe positioning approaches
   - Test in incognito mode (rule out extensions)

4. **Network Analysis**
   - Check if TokenEx CDN script is loading
   - Verify iframe source URL is accessible
   - Look for CORS errors in network tab
   - Check for blocked requests

## Files Modified
- `src/components/lights/MultiStepCheckout.tsx`
- `src/index.css`

## Related Documentation
- TokenEx Integration Guide
- TokenEx Iframe API Documentation
- Previous issue resolution from last Sunday

## Questions to Answer
1. What does the browser console show during TokenEx initialization?
2. Are there any CORS or CSP errors in the console?
3. Is the TokenEx iframe actually loading (check DOM inspector)?
4. What is the account status in TokenEx dashboard?
5. Are there domain restrictions configured in TokenEx?

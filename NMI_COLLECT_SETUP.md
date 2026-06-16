# NMI Collect.js Setup Guide

## What Changed

We've switched from passing raw card data through our servers to using **NMI's Collect.js** tokenization. This is the proper, PCI-compliant way to handle payments.

## Architecture

```
Customer enters card data
        ↓
NMI Collect.js iFrame (client-side tokenization)
        ↓
Token sent to our edge function (no card data touches our servers)
        ↓
Edge function sends token to NMI for processing
        ↓
NMI processes payment through Propay MID 33595002
        ↓
Transaction result returned
```

## Why This Matters

**Before:** Raw card numbers were being sent through our frontend → edge function → NMI
- High PCI compliance scope
- Card data in our logs
- Security risk

**Now:** Card data is tokenized by NMI's iFrame before leaving the browser
- Minimal PCI compliance scope
- Only tokens in our logs
- Industry standard security

## Getting Your NMI Tokenization Key

1. **Log into NMI Gateway**
   - Go to: https://secure.digitzs.transactiongateway.com
   - Use your merchant credentials

2. **Navigate to Security Keys**
   - Click "Settings" in the top menu
   - Click "Security Keys" in the left sidebar
   - Look for "Public Security Keys" section

3. **Generate Tokenization Key**
   - Click "Add Key" or "Generate New Key"
   - Key Type: Select "Tokenization Key" or "Public Key"
   - Description: "Collect.js Tokenization"
   - Click "Generate"

4. **Copy the Key**
   - You'll see something like: `2Nt6X9-w8h5Y2-7Kg4M3-Pq9R5s`
   - Copy this key (it's safe to use client-side)

5. **Add to Your .env File**
   ```bash
   VITE_NMI_TOKENIZATION_KEY=2Nt6X9-w8h5Y2-7Kg4M3-Pq9R5s
   ```

## Important Notes

- **Tokenization keys are PUBLIC** - they're meant to be used in client-side JavaScript
- Different from your Security Key (which is private and stays server-side)
- The security key is already configured in Supabase edge functions
- The tokenization key goes in the .env file for the frontend

## Testing

Once you add the tokenization key:

1. Restart your dev server (if running)
2. Go to any event checkout page
3. Click "Buy Tickets"
4. The payment form should load with NMI's secure iFrames
5. Use test card: **4111111111111111**
6. Expiry: Any future date (e.g., 12/25)
7. CVV: Any 3 digits (e.g., 999)

## What Happens Behind the Scenes

1. **CollectJS Script Loads**
   ```javascript
   <script src="https://secure.digitzs.transactiongateway.com/token/Collect.js"
           data-tokenization-key="YOUR_KEY_HERE"></script>
   ```

2. **iFrames Render**
   - Card number field
   - Expiry field
   - CVV field
   - All secured by NMI, not visible to our code

3. **User Submits**
   - CollectJS tokenizes the card data
   - Returns a token like: `abc123-token-xyz789`
   - Our code sends only this token to the edge function

4. **Edge Function Processes**
   ```javascript
   if (paymentToken) {
     // Send token to NMI
     formData.payment_token = paymentToken;
   } else {
     // Legacy: raw card data (not recommended)
     formData.ccnumber = cardNumber;
   }
   ```

5. **NMI Processes**
   - Detokenizes the card data
   - Processes through Propay MID 33595002
   - Returns transaction result

## Comparison with Tokenex

**Tokenex (What we had before):**
- Third-party tokenization service
- $500-1000/month cost
- Access to 200+ processors
- Recently deactivated due to billing issue

**NMI Collect.js (What we have now):**
- Built into NMI gateway (no extra cost)
- Same PCI compliance benefits
- Works only with NMI/Digitzs gateway
- More direct integration

## Troubleshooting

### CollectJS Script Fails to Load
- Check your tokenization key is correct
- Verify you're using the right gateway URL
- Check browser console for CORS errors

### Fields Don't Render
- Make sure the DOM elements exist before initializing
- Check the selector IDs match: `#ccnumber`, `#ccexp`, `#cvv`
- Look for JavaScript errors in console

### Token Not Generated
- Verify all required fields are filled
- Check validation callback for errors
- Ensure you're calling `CollectJS.startPaymentRequest()`

### NMI Sees No Transactions
- This was the original problem
- Now with proper logging, you'll see:
  - "=== EDGE FUNCTION INVOKED ==="
  - "Using payment token (PCI compliant)"
  - "=== STEP 5: SENDING TO DIGITZS ==="
  - The actual HTTP request to NMI

## Support

If you need help finding your tokenization key:
- **NMI Support:** support@nmi.com or (800) 617-4850
- **Portal:** https://secure.digitzs.transactiongateway.com
- **Documentation:** https://www.nmi.com/integrate/collectjs/

## Security Best Practices

1. **Never log card data** - only log tokens
2. **Use HTTPS everywhere** - CollectJS requires it
3. **Keep security keys private** - only use tokenization keys client-side
4. **Monitor for fraud** - check transactions regularly
5. **Update regularly** - keep CollectJS script reference current

## Next Steps

1. Get your tokenization key from NMI portal
2. Add it to `.env` file
3. Test the checkout flow
4. Check Supabase logs to confirm requests reach NMI
5. Contact NMI support to confirm they're seeing the transactions

---

**Last Updated:** March 27, 2026
**Status:** Ready for tokenization key
**PCI Compliance:** Significantly improved

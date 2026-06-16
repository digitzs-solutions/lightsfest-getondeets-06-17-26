# TokenEx Whitelisting Request

**URGENT: Need domain whitelisted for live transaction testing**

---

## What We Need

**Whitelist these origins in TokenEx dashboard** so the Lights Festival checkout can process live transactions:

### Current Testing URL (Share once deployed)
```
[YOUR CURRENT DEPLOYMENT URL - e.g., https://xxx.bolt.new or https://xxx.vercel.app]
```

### Future Production URL
```
https://lightsfest.ondeets.ai
```

---

## Where to Whitelist in TokenEx

1. Login to **TokenEx Portal**: https://portal.tokenex.com
2. Navigate to: **Settings → Allowed Origins** (or API Settings → CORS)
3. Add the URLs above
4. Save changes

---

## Why We Need This

The Lights Festival checkout uses:
- **TokenEx Transparent Gateway** (iframe) for secure card tokenization
- **Kount 360** for fraud detection (enabled via TokenEx)
- **Digitzs v2 → ProPay** for payment processing

**Without whitelisting, TokenEx will block the iframe from loading due to CORS restrictions.**

---

## What Happens After Whitelisting

Once whitelisted, we can run **live end-to-end transactions** and see:

✅ **TokenEx Dashboard**: Tokenization events + Kount session IDs
✅ **Kount 360 Dashboard**: Device fingerprints + fraud scores
✅ **ProPay MyIQ**: Transaction details + settlement data
✅ **Supabase DB**: Complete registration records

---

## Test Transaction Flow

```
User enters card in checkout
    ↓
TokenEx iframe tokenizes card
    ↓
Kount 360 fingerprints device
    ↓
Token sent to Supabase Edge Function
    ↓
Edge function → Digitzs v2 API
    ↓
Digitzs → ProPay gateway
    ↓
Transaction processed
    ↓
TicketSocket order created
    ↓
All data saved to Supabase
```

---

## Current TokenEx Configuration

- **Token Ex ID**: (whatever is configured in edge function)
- **Token Scheme**: `sixTOKENfour`
- **HMAC Authentication**: Enabled
- **Kount 360**: Enabled
- **CVV Collection**: Enabled

---

## Timeline

**As soon as URL is whitelisted**, we can:
1. Run live test transactions
2. Verify full flow in all dashboards
3. Demonstrate to investors/partners
4. Prepare for production launch

---

## Contact

If you need any technical details or have questions about the integration:
- **Codebase**: Production-ready ✅
- **Edge Functions**: Deployed ✅
- **Database**: Configured ✅
- **Only blocker**: TokenEx domain whitelisting

---

**Thank you! Once whitelisted, we're ready to process live transactions immediately.**

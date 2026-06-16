# Live Transaction Testing Guide

## The Problem: TokenEx Token → Digitzs v2 Direct API = FAILURE

### What's Happening

```
Frontend sends:
  paymentToken: "424242cO44OC4242" (TokenEx token)
  
Edge function tries:
  POST digitzs.transactiongateway.com/api/transact.php
  {
    ccnumber: "424242cO44OC4242"  ← This is a TOKEN, not a PAN!
  }
  
NMI Direct Post API responds:
  response_code: "11111"
  message: "Invalid card number or token format"
```

### Why It Fails

**Digitzs v2 Direct Post API** (`digitzs.transactiongateway.com/api/transact.php`) accepts:
1. ✅ Raw 16-digit PAN (e.g., `4111111111111111`) - **PCI SCOPE ISSUE**
2. ✅ NMI Collect.js tokens (e.g., from their iframe)
3. ❌ TokenEx tokens (not compatible)

**TokenEx tokens** are proprietary and can ONLY be used with:
- TokenEx Transparent Gateway API
- Payment systems that integrate with TokenEx API
- Your Payvia v4 API wrapper (which detokenizes server-side)

## Solution Options

### Option 1: Use Payvia v4 API (RECOMMENDED)
**Status:** ✅ Already implemented and working in staging
**Edge function:** `payvia-process`
**Flow:**
```
TokenEx token → Your edge function → Payvia v4 API → 
Payvia detokenizes → Digitzs v2 → ProPay MID 33595002 → Approved
```

**Update checkout to use:**
```javascript
const paymentResponse = await fetch(
  `${supabaseUrl}/functions/v1/payvia-process`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: totalAmount,
      currency: 'USD',
      orderId: `LIGHTS-${Date.now()}`,
      tokenexToken: tokenResult.token,
      expirationDate: '12/29',
      cardholderName: `${contactInfo.firstName} ${contactInfo.lastName}`,
      customerInfo: {
        firstName: contactInfo.firstName,
        lastName: contactInfo.lastName,
        email: contactInfo.email,
        phone: contactInfo.phone,
      },
      eventInfo: {
        eventName: event.title,
        eventDate: eventDetails.selectedDate,
      },
    }),
  }
);
```

### Option 2: TokenEx Transparent Gateway → ProPay Direct
**Status:** ⚠️ Needs ProPay cert/terminal credentials
**Edge function:** `propay-process`
**Flow:**
```
TokenEx token → Your edge function → TokenEx TPG API → 
TokenEx detokenizes → ProPay Direct API → Approved
```

**Missing credentials:**
- ProPay Cert String (from ProPay portal)
- ProPay Terminal ID (from ProPay portal)

### Option 3: NMI Collect.js → Digitzs Direct
**Status:** ✅ Works but requires changing tokenization
**Edge function:** `digitzs-direct`
**Flow:**
```
NMI Collect.js iframe → NMI token → Your edge function → 
Digitzs Direct Post API → ProPay MID 33595002 → Approved
```

**Requires:** Switching from TokenEx iframe to NMI Collect.js iframe

## Recommended Action: Switch to Payvia v4 API

The `payvia-process` edge function is already deployed and working. Just update the checkout component.

### Quick Fix

1. **Update checkout endpoint:**
```bash
# Change from:
/functions/v1/digitzs-tokenex

# To:
/functions/v1/payvia-process
```

2. **Update request payload format:**
```javascript
// Old format (won't work):
{
  paymentToken: tokenResult.token
}

// New format (Payvia v4):
{
  tokenexToken: tokenResult.token,
  expirationDate: '12/29',
  cardholderName: `${firstName} ${lastName}`
}
```

3. **Test with live card**

### Why Payvia v4 is Best

✅ **Already implemented** - No new code needed  
✅ **Handles TokenEx tokens** - Detokenizes server-side  
✅ **PCI compliant** - Token never becomes PAN on your servers  
✅ **Works with existing ProPay MID** - `33595002`  
✅ **Production ready** - Used by other live sites  

## Understanding v2 vs v3

### v2 (Current Legacy Path - PCI SCOPE ISSUE)
```
Frontend → RAW CARD → Digitzs v2 API → ProPay
  ⚠️ Raw PAN touches your servers = IN PCI SCOPE
```

### v3 (Target Architecture - OUT OF PCI SCOPE)
```
Frontend → TokenEx iframe → Token → Payvia v4 API → 
Digitzs → ProPay (with token staying tokenized)
  ✅ Token never becomes PAN on your servers = OUT OF PCI SCOPE
```

You were given 6 months to migrate from v2 → v3, which is exactly what the Payvia v4 API accomplishes.

## Next Steps

Would you like me to:
1. ✅ Update checkout to use `payvia-process` edge function (FASTEST)
2. Get ProPay credentials and set up TokenEx TPG direct path
3. Switch to NMI Collect.js tokenization

**Recommendation: Option 1** - It's already built and tested.

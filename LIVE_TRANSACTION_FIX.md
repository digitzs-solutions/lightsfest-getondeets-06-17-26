# Live Transaction Fix - TokenEx to ProPay

## Current Problem

The "11111" error occurs because:
1. The checkout sends a **TokenEx token** (e.g., `424242cO44OC4242`)
2. The edge function sends it to **NMI Direct Post API** (`digitzs.transactiongateway.com/api/transact.php`)
3. NMI Direct Post API doesn't understand TokenEx tokens - it expects NMI Collect.js tokens or raw card data

## Solution Options

### Option 1: TokenEx Transparent Gateway → ProPay (RECOMMENDED)
**What you need:**
- ✅ TokenEx ID (you have: `Y9ir...`)
- ❓ TokenEx API Key (need to verify in Supabase secrets: `TOKENEX_API_KEY`)
- ✅ ProPay MID: `33595002` (you have)
- ❓ ProPay Cert String (need from ProPay portal)
- ❓ ProPay Terminal ID (need from ProPay portal)

**Flow:**
```
Frontend → TokenEx iframe → Token → Your edge function →
TokenEx TPG API → Detokenizes → ProPay MID 33595002 → Approved
```

**Edge function:** `propay-process` (already exists, needs ProPay credentials)

**Missing:** ProPay cert string and terminal ID

### Option 2: Digitzs v2 API Wrapper (IF AVAILABLE)
**What you need:**
- ✅ Digitzs Merchant ID (you have)
- ✅ Digitzs API Key (you have)
- ❓ Check if Digitzs has a v2 API endpoint that accepts TokenEx tokens

**Flow:**
```
Frontend → TokenEx iframe → Token → Your edge function →
Digitzs v2 API → ProPay MID 33595002 → Approved
```

**Status:** Need to verify if Digitzs v2 API supports TokenEx tokens

### Option 3: NMI Collect.js → Digitzs Direct Post API (WORKING)
**What you need:**
- ✅ Digitzs Security Key (you have)
- ✅ Use NMI Collect.js instead of TokenEx

**Flow:**
```
Frontend → NMI Collect.js iframe → NMI Token → Your edge function →
NMI Direct Post API → ProPay MID 33595002 → Approved
```

**Edge function:** `digitzs-direct` (already works with NMI tokens)

**Status:** This path works, but requires switching from TokenEx to NMI Collect.js

## Recommended Next Steps

### To use TokenEx → ProPay (Option 1):

1. **Get ProPay credentials from ProPay portal:**
   - Login to ProPay merchant portal
   - Find: Cert String
   - Find: Terminal ID

2. **Set in Supabase edge function secrets:**
   ```bash
   PROPAY_CERT_STR=your_cert_string_here
   PROPAY_TERMINAL_ID=your_terminal_id_here
   ```

3. **Update checkout to use `propay-process` edge function**

4. **Test with live card**

### To verify Digitzs v2 API (Option 2):

1. **Contact Digitzs support:**
   - Ask: "Does your v2 API accept TokenEx tokens?"
   - Ask: "What's the endpoint for processing TokenEx tokens?"
   - Ask: "Do I need special configuration for TokenEx integration?"

2. **Check Digitzs API documentation**

### To use NMI Collect.js (Option 3 - FASTEST):

1. Already implemented in `digitzs-direct` edge function
2. Switch frontend from TokenEx iframe to NMI Collect.js
3. Works immediately with your existing credentials

## Current Credentials Status

```bash
✅ DIGITZS_MERCHANT_ID=ticketso-clevergroup-33595002-4398786-1724692895
✅ DIGITZS_SECURITY_KEY=pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2
✅ TOKENEX_ID=Y9ir...
❓ TOKENEX_API_KEY (need to verify exists in secrets)
✅ PROPAY_ACCOUNT_NUM=33595002
❓ PROPAY_CERT_STR (need from ProPay portal)
❓ PROPAY_TERMINAL_ID (need from ProPay portal)
```

## What To Do Right Now

**Option A (TokenEx → ProPay):**
Get ProPay cert string and terminal ID from ProPay portal, then I'll configure it.

**Option B (Verify Digitzs v2):**
Contact Digitzs to ask if they support TokenEx tokens.

**Option C (Use NMI Collect.js):**
Switch to NMI Collect.js (works immediately, no new credentials needed).

Which option do you want to pursue?

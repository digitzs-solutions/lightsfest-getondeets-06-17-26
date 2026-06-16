# Quick Start: Digitzs Direct Integration

## What You Need Right Now

Your TokenEx account is temporarily disabled, but you can still process payments using the **direct Digitzs/NMI integration** connected to the same Propay MID 33595002.

---

## Step 1: Get Your Security Key (5 minutes)

### Log into Digitzs Gateway

1. Go to: **https://digitzs.transactiongateway.com**
2. Log in with your merchant credentials

### Find Your Security Key

1. Click **Settings** in the top menu
2. Select **Security Keys**
3. Click **API Security Keys** tab
4. Copy the 32-character key (looks like: `2F822Rw39fx762MaV7Yy86jXGTC7sCDy`)

**Don't have a key?** Click "Generate New Key" button.

---

## Step 2: Add Key to Supabase (2 minutes)

### Via Dashboard

1. Open your Supabase project: **https://hppsbqucfklrrytfftye.supabase.co**
2. Go to **Edge Functions** → **Secrets**
3. Click **Add new secret**
4. Enter:
   - Name: `DIGITZS_SECURITY_KEY`
   - Value: [paste your 32-character key]
5. Click **Save**

---

## Step 3: Test the Integration (2 minutes)

### Open Your Application

1. Navigate to your site
2. Go to the Dinosaur Island tickets page
3. Click "Get Tickets"
4. Select an event

### Complete Test Transaction

**Fill in the form:**
- First Name: Test
- Last Name: User
- Email: test@example.com
- Phone: 5551234567

**Enter test card:**
- Card Number: `4242 4242 4242 4242`
- Expiry: `12/25`
- CVV: `123`

**Submit Payment**

### Success Indicators

✅ No "security key missing" error
✅ Payment processes successfully
✅ You receive a transaction ID
✅ Success message appears

---

## That's It!

Your direct Digitzs integration is now live and processing real payments through Propay MID 33595002.

### What Happens Now

**Current Flow:**
```
Customer → DigitzsCheckout → digitzs-direct edge function →
Digitzs Gateway → Propay MID 33595002 → Card Networks
```

**When TokenEx Reactivates:**
- The system will automatically switch back to TokenEx
- Direct integration remains as backup
- No code changes needed
- Same MID, same processor

---

## Troubleshooting

### Still Getting "Security Key Missing"?

1. **Verify secret was saved:**
   - Supabase Dashboard → Edge Functions → Secrets
   - Look for `DIGITZS_SECURITY_KEY` in the list

2. **Check the key is correct:**
   - Log into digitzs.transactiongateway.com
   - Settings → Security Keys → API Security Keys
   - Copy the key again (no spaces or line breaks)

3. **Test the key directly:**
```bash
curl -X POST https://digitzs.transactiongateway.com/api/transact.php \
  -d "security_key=YOUR_KEY_HERE" \
  -d "type=validate"
```

Expected: `response=1&responsetext=SUCCESS`

### Transaction Declining?

Check:
- ✅ MID 33595002 is active in Digitzs portal
- ✅ Card number is valid (use test card 4242424242424242)
- ✅ Expiry date is in the future
- ✅ Amount is reasonable (not $0.00 or too large)

### Need Help?

**Digitzs Support:**
- Email: support@nmi.com
- Phone: 1-866-481-3280

**Your Merchant Rep:**
- Laura@digitzs.com

---

## What You're Processing

**Gateway:** Digitzs white-label NMI
**MID:** 33595002 (Propay)
**Endpoint:** https://digitzs.transactiongateway.com/api/transact.php
**Same as TokenEx:** Yes - same MID, same processor

---

## Documentation

**Full guides in `/docs/tokenex-architecture/`:**
- `DIGITZS_NMI_SECURITY_KEY.md` - Detailed security key setup
- `TOKENEX_END_TO_END_PROCESS.md` - TokenEx recovery checklist
- `DIGITZS_DIRECT_INTEGRATION.md` - Direct API implementation
- `IMPLEMENTATION_STATUS.md` - Current system status

# 🚀 Test Live Transactions from Localhost (Using ngrok)

## Why You Need This

TokenEx requires:
- ✅ HTTPS (not HTTP)
- ✅ Valid SSL certificate
- ✅ Whitelisted domain

Localhost doesn't meet these requirements, but **ngrok** creates a secure tunnel with HTTPS.

---

## Quick Setup (5 Minutes)

### Step 1: Install ngrok

**macOS:**
```bash
brew install ngrok
```

**Windows/Linux:**
Download from: https://ngrok.com/download

Or use npm:
```bash
npm install -g ngrok
```

### Step 2: Sign Up for ngrok (Free)

1. Go to: https://dashboard.ngrok.com/signup
2. Create free account
3. Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken

### Step 3: Configure ngrok

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Step 4: Start Your Dev Server

```bash
npm run dev
```

This will start on `http://localhost:5173` (or similar)

### Step 5: Start ngrok Tunnel

**In a new terminal:**
```bash
ngrok http 5173
```

You'll see output like:
```
Session Status                online
Account                       Your Name (Plan: Free)
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:5173
```

**Copy that HTTPS URL!** Example: `https://abc123def456.ngrok-free.app`

---

## Step 6: Request TokenEx Whitelisting

### Option A: Email IXOPAY Support Directly

```
To: support@tokenex.com
Subject: Urgent: Whitelist ngrok URL for Testing

Hello,

I need to test live transactions but don't have access to our team members right now.

Please whitelist this temporary testing URL:
https://abc123def456.ngrok-free.app

This is a secure ngrok tunnel with valid SSL that routes to my local development environment.

Account: [Your Digitzs/IXOPAY account name]
TokenEx ID: [Your TokenEx ID if you have it]

I need this for validating the full transaction flow:
- TokenEx tokenization
- Kount 360 fraud check
- Digitzs v2 routing
- ProPay processing

Thank you for your urgent assistance.
```

### Option B: Use TokenEx Self-Service Dashboard (If You Have Access)

1. Login to: https://portal.tokenex.com
2. Go to: **Settings** → **Allowed Origins**
3. Click: **Add New Origin**
4. Enter: `https://abc123def456.ngrok-free.app`
5. Save

---

## Step 7: Test Live Transaction

Once whitelisted:

1. Open your ngrok URL: `https://abc123def456.ngrok-free.app`
2. Click "Get Your Tickets"
3. Fill out form with REAL information
4. Use a REAL credit card (small amount will be charged)
5. Submit transaction

### Expected Results:

**✅ In TokenEx Dashboard:**
- New token created
- Card data securely stored
- Transaction logged

**✅ In Kount 360 Dashboard:**
- New event with your Kount Session ID
- Risk score calculated
- Fraud analysis results

**✅ In Your Bank Account:**
- Transaction should appear (pending/settled)
- Might take 1-3 business days to fully settle

**✅ In Supabase Database:**
- Check `registrations` table
- Your transaction should be saved with:
  - payment_token
  - kount_session_id
  - propay_transaction_id

---

## Testing with Test Cards (Won't Show in Bank)

If you want to validate the flow WITHOUT real charges:

### ProPay Test Cards:
```
Card: 4111111111111111
CVV: 999
Expiry: 12/25 (any future date)
Name: Test User
Zip: 12345
```

**Note:** Test cards will show in TokenEx and Kount, but NOT in your bank account.

---

## Important Notes

### ngrok Free Tier Limitations:
- ⚠️ URL changes each time you restart ngrok
- ⚠️ You'll need to request whitelisting each time URL changes
- ⚠️ Limited to 40 connections/minute

### Better Alternative: ngrok Static Domain (Paid)

**Cost:** $8/month

**Benefit:** Same URL every time, only whitelist once

```bash
# Reserve a static domain in ngrok dashboard
# Then use it:
ngrok http 5173 --domain=your-static-domain.ngrok-free.app
```

---

## Troubleshooting

### "Origin not allowed" error
**Cause:** ngrok URL not yet whitelisted in TokenEx
**Solution:** Contact IXOPAY support or wait for whitelisting

### ngrok URL expired
**Cause:** Restarted ngrok (free tier gives new URL each time)
**Solution:**
1. Get new URL from ngrok terminal
2. Request whitelisting again
3. Or upgrade to static domain ($8/month)

### Transaction fails with "Invalid security key"
**Cause:** Digitzs security key not configured
**Solution:** Check your `.env` file has correct `VITE_DIGITZS_SECURITY_KEY`

### Kount session not created
**Cause:** Kount 360 not properly initialized
**Solution:** Check browser console for Kount errors

---

## Verification Checklist

After successful transaction:

- [ ] Check TokenEx Dashboard - token created?
- [ ] Check Kount 360 Dashboard - session logged?
- [ ] Check Supabase `registrations` table - data saved?
- [ ] Check bank account - transaction pending? (if using real card)
- [ ] Check ProPay/MyIQ Dashboard - transaction recorded?

---

## Quick Commands Reference

```bash
# Start dev server
npm run dev

# In new terminal - start ngrok
ngrok http 5173

# Check what's running
lsof -i :5173
```

---

## Alternative: Cloudflare Tunnel (Free, Persistent URL)

If you have Cloudflare account:

```bash
# Install
npm install -g cloudflared

# Login
cloudflared login

# Create tunnel
cloudflared tunnel create lightsfest-test

# Start tunnel
cloudflared tunnel --url http://localhost:5173
```

This gives you a persistent URL that won't change.

---

## Next Steps

1. Install ngrok: `brew install ngrok` or `npm install -g ngrok`
2. Start dev server: `npm run dev`
3. Start ngrok: `ngrok http 5173`
4. Copy HTTPS URL
5. Request TokenEx whitelisting (email support@tokenex.com)
6. Wait for confirmation (usually same day for urgent requests)
7. Test live transaction
8. Verify in all dashboards

---

**Once you have access to Tristan/Tommy, you can deploy to Vercel for a permanent solution.**

For now, this lets you test live transactions from localhost with valid HTTPS!

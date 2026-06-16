# Lights Festival Deployment Guide

## Quick Deploy Options

### Option 1: Current Preview URL (Fastest - 2 minutes)

**If this project is already deployed (Bolt.new, Vercel preview, etc.):**

1. **Find your current URL** - Check browser address bar or deployment dashboard
2. **Whitelist in TokenEx**:
   - Login to TokenEx Dashboard
   - Navigate to Settings → Allowed Origins
   - Add your URL (e.g., `https://your-project.bolt.new`)
3. **Test immediately!**

---

### Option 2: Deploy to Vercel (5 minutes)

#### Step 1: Push to GitHub
```bash
# If not already a git repo
git init
git add .
git commit -m "Lights Festival production ready"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/lightsfest.git
git push -u origin main
```

#### Step 2: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=https://hppsbqucfklrrytfftye.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHNicXVjZmtscnJ5dGZmdHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTIzNDMsImV4cCI6MjA4OTY4ODM0M30.e_XiXMdvIMyRX6noViWDUm9T7JTIhl0hRqpIsBVKKvk
   ```

5. Click **Deploy**

#### Step 3: Get Deployment URL
- Vercel will give you a URL like: `https://lightsfest-xyz123.vercel.app`
- **Save this URL** for TokenEx whitelisting

---

### Option 3: Use Temporary Subdomain (Alternative)

If you want to deploy under `*.ondeets.ai` subdomain:

1. **Deploy to Vercel first** (see Option 2)
2. **Add Custom Domain in Vercel**:
   - Go to Project Settings → Domains
   - Add: `lightsfest-demo.ondeets.ai` (or any subdomain)
3. **Update DNS** (ask Tristan/Tommy):
   - Add CNAME record: `lightsfest-demo` → `cname.vercel-dns.com`

---

## TokenEx Whitelisting Instructions

Once you have your deployment URL:

### 1. Login to TokenEx Dashboard
- URL: https://portal.tokenex.com (or your specific portal)
- Use your TokenEx credentials

### 2. Whitelist Your Domain
- Navigate to: **Settings** → **Allowed Origins** (or Security Settings)
- Add your deployment URL(s):
  - `https://your-deployment.vercel.app`
  - `https://lightsfest.ondeets.ai` (when ready)
  - `https://lightsfest-demo.ondeets.ai` (if using temp subdomain)

### 3. Verify Configuration
- Make sure these are set correctly in TokenEx:
  - **Token Ex ID**: Should match what's in your edge function
  - **Token Scheme**: `sixTOKENfour`
  - **HMAC Key**: Must match your edge function secret

---

## Testing the Live Integration

Once deployed and whitelisted:

1. **Open your deployment URL**
2. **Click "Get Tickets"** on Lights Festival page
3. **Fill in the checkout form**:
   - Select ticket quantity
   - Enter contact info
   - Enter payment details

### Test Cards (ProPay Sandbox)
```
Card: 4111111111111111
Expiry: 12/29
CVV: 999
```

### What Happens During Transaction

**Frontend (Your Browser):**
1. TokenEx iframe loads securely
2. User enters card details
3. TokenEx tokenizes the card → returns token + Kount Session ID

**Backend Flow:**
```
TokenEx Token
    ↓
Supabase Edge Function: payvia-process
    ↓
Digitzs v2 API (with token)
    ↓
ProPay Gateway
    ↓
Return: Transaction ID + Result
```

**What You'll See:**
- ✅ **TokenEx**: Token created, Kount session tracked
- ✅ **Kount 360**: Device fingerprinting + fraud score
- ✅ **ProPay**: Transaction processed in MyIQ dashboard
- ✅ **TicketSocket**: Order created
- ✅ **Supabase**: Registration saved with all IDs

---

## Viewing Live Transaction Data

### 1. TokenEx Portal
- View tokenization events
- Check Kount session IDs
- Monitor authentication events

### 2. Kount 360 Dashboard
- See fraud scores
- View device fingerprints
- Check risk indicators

### 3. ProPay MyIQ Dashboard
- View transaction details
- Check settlement status
- See batch reports

### 4. Supabase Database
```sql
-- View all registrations with payment data
SELECT
  id,
  first_name,
  last_name,
  email,
  tickets_quantity,
  payment_token,
  kount_session_id,
  propay_transaction_id,
  order_status,
  created_at
FROM registrations
ORDER BY created_at DESC;
```

---

## Troubleshooting

### TokenEx iframe not loading
- **Check**: Origin is whitelisted in TokenEx dashboard
- **Check**: Browser console for CORS errors
- **Check**: Network tab for failed requests to TokenEx

### Authentication Failed
- **Check**: HMAC key matches in edge function
- **Check**: Timestamp is current (not cached)
- **Check**: Token Ex ID is correct

### Payment Processing Fails
- **Check**: Digitzs credentials are correct
- **Check**: ProPay MID is active
- **Check**: Edge function environment variables are set

### No Kount Data
- **Check**: `fraudServices: { kount: true }` in TokenEx config
- **Check**: Kount 360 is enabled for your TokenEx account
- **Verify**: `kountSessionId` is in tokenize response

---

## Current Configuration Summary

### Environment Variables (Set in Vercel)
```bash
# Supabase
VITE_SUPABASE_URL=https://hppsbqucfklrrytfftye.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# These are in Edge Functions (already configured):
DIGITZS_MERCHANT_ID=ticketso-clevergroup-33595002-4398786-1724692895
DIGITZS_SECURITY_KEY=pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2
DIGITZS_API_URL=https://api.digitzs.com/v2
TOKENEX_ID=(your TokenEx ID)
TOKENEX_API_KEY=(your TokenEx API key)
TICKETSOCKET_API_KEY=ad691a59acd46cc3df62320c89706ba9-835088
```

### Payment Flow
- **Frontend**: TokenEx Transparent Gateway (iframe)
- **Token Storage**: TokenEx vault
- **Fraud Prevention**: Kount 360
- **Gateway**: Digitzs v2 API
- **Processor**: ProPay
- **Ticketing**: TicketSocket
- **Database**: Supabase PostgreSQL

---

## Next Steps

1. ✅ Deploy to Vercel (or use current preview URL)
2. ✅ Get deployment URL
3. ✅ Share URL with Tristan/Tommy to whitelist in TokenEx
4. ✅ Test with live transaction
5. ✅ Monitor in TokenEx, Kount, ProPay dashboards
6. ✅ Verify data in Supabase

---

## Support Contacts

- **Domain/DNS**: Tristan, Tommy
- **TokenEx Whitelisting**: Tristan, Tommy (have TokenEx admin access)
- **ProPay Support**: Check MyIQ dashboard or contact ProPay
- **This Codebase**: Already production-ready!

---

## What's Already Working

✅ TokenEx iframe integration with HMAC authentication
✅ Kount 360 device fingerprinting enabled
✅ Digitzs v2 API integration (ProPay gateway)
✅ TicketSocket order creation
✅ Supabase database storage
✅ Complete checkout flow with 3 steps
✅ Error handling and validation
✅ Responsive design
✅ Production build tested

**The app is ready to go - just needs deployment URL whitelisted in TokenEx!**

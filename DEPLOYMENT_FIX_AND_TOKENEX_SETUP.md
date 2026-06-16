# Deployment Fix & TokenEx Domain Whitelist Guide

## Issue: "requested path is invalid"

This error occurs when deploying Single Page Applications (SPAs) to platforms that don't properly handle client-side routing.

## ✅ What I Fixed

### 1. Updated `vercel.json`
Added proper security headers and ensured SPA routing works correctly:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

This ensures all routes redirect to `index.html` (which is how SPAs work) and adds security headers.

### 2. Verified Build Process
Confirmed the project builds successfully with no errors.

---

## 🔐 TokenEx Domain Whitelisting

### Current Status

**✅ Whitelisted Domains:**
- `https://hppsbqucfklrrytfftye.supabase.co` (your current deployment)

**⚠️ Potentially Blocked:**
- `localhost:5173` or `localhost:3000` (development - not whitelisted in production TokenEx)
- Any new production domains you deploy to

### Why TokenEx Blocks Non-Whitelisted Domains

TokenEx uses **CORS (Cross-Origin Resource Sharing)** to prevent unauthorized websites from using your tokenization credentials. If a domain isn't whitelisted:

1. Browser blocks the TokenEx iframe from loading
2. Card tokenization fails silently or with CORS errors
3. Transactions cannot proceed

### How to Whitelist New Domains

#### Option 1: TokenEx Portal (Recommended)
1. Login to **https://portal.tokenex.com**
2. Navigate to **Settings → Allowed Origins** (or **API Settings → CORS**)
3. Click **Add Origin**
4. Enter your domain exactly as it appears in the browser:
   ```
   https://yourdomain.com
   ```
5. Click **Save**
6. Wait 2-5 minutes for changes to propagate

#### Option 2: Contact TokenEx Support
If you don't have portal access:
- Email: **support@tokenex.com**
- Subject: "Add Allowed Origin for Production Deployment"
- Include:
  - Your TokenEx ID
  - Domain to whitelist
  - Brief explanation (e.g., "Production deployment of Lights Festival checkout")

---

## 🧪 Testing After Deployment

### 1. Test on Whitelisted Domain
Visit: `https://hppsbqucfklrrytfftye.supabase.co`

**Expected behavior:**
- ✅ Page loads without errors
- ✅ "Get Your Tickets" button opens checkout
- ✅ TokenEx iframe loads inside checkout form
- ✅ Can enter card details
- ✅ Form submits and processes transaction

### 2. Test on Non-Whitelisted Domain (will fail)
Visit: `http://localhost:5173`

**Expected behavior:**
- ⚠️ Yellow warning banner appears
- ⚠️ Checkout form shows warning about domain not whitelisted
- ⚠️ Transaction will fail even though form appears to work

### 3. Verify Transaction Success
After successful test on whitelisted domain:

1. **Check TokenEx Dashboard**
   - Login to https://portal.tokenex.com
   - View recent tokenization events
   - Verify token was created

2. **Check Kount 360 Dashboard**
   - Login to your Kount portal
   - View device fingerprints
   - Check fraud scores

3. **Check ProPay MyIQ**
   - Login to ProPay merchant portal
   - View transaction history
   - Verify payment was processed

4. **Check Supabase Database**
   - Open Supabase dashboard
   - Navigate to Table Editor → `registrations`
   - Verify new registration with:
     - Payment token
     - Kount session ID
     - ProPay transaction ID

---

## 🚀 Deployment Checklist

### Before Deploying to New Domain:

- [ ] Whitelist the domain in TokenEx portal
- [ ] Wait 5 minutes for TokenEx changes to propagate
- [ ] Deploy the application
- [ ] Test the checkout flow end-to-end
- [ ] Verify all dashboard entries (TokenEx, Kount, ProPay, Supabase)

### After Deploying:

- [ ] Remove localhost warning banners (they're only needed for dev)
- [ ] Update `.env` with production URLs
- [ ] Configure custom domain DNS (if applicable)
- [ ] Enable SSL/TLS certificate
- [ ] Set up monitoring/logging

---

## 📋 Domains That Need Whitelisting

Update this list as you deploy:

| Domain | Purpose | TokenEx Status | Notes |
|--------|---------|----------------|-------|
| `https://hppsbqucfklrrytfftye.supabase.co` | Current deployment | ✅ Whitelisted | Working |
| `http://localhost:5173` | Local development | ⚠️ Not whitelisted | Expected - dev only |
| `https://lightsfest.ondeets.ai` | Production (future) | ❓ Unknown | Add before launch |
| `[Your staging URL]` | Staging environment | ❓ Unknown | Add if needed |

---

## 🔧 Troubleshooting

### "Origin not allowed" error
**Cause**: Domain not whitelisted in TokenEx
**Solution**: Add domain to TokenEx allowed origins

### TokenEx iframe doesn't load
**Cause**: CORS policy blocking the iframe
**Solution**: Verify domain is exactly as it appears in browser, including `https://`

### Form submits but no transaction
**Cause**: Token created but not sent to backend
**Solution**: Check browser console for JavaScript errors

### "Authentication failed" error
**Cause**: TokenEx HMAC authentication issue
**Solution**: Verify TokenEx credentials in edge function environment variables

---

## 📞 Support Contacts

**TokenEx Support:**
- Portal: https://portal.tokenex.com
- Email: support@tokenex.com
- Phone: Check your TokenEx account details

**Digitzs Support:**
- For API issues with payment processing
- Check your Digitzs account for contact info

**ProPay Support:**
- For merchant account and settlement issues
- Login to ProPay MyIQ portal

---

## ✅ Summary

Your application is now configured correctly for deployment. The main takeaways:

1. **Vercel.json is fixed** - SPA routing works properly
2. **Build is successful** - Ready to deploy
3. **TokenEx whitelisting is required** - Add any new production domains before going live
4. **Current whitelisted domain works** - Test on `https://hppsbqucfklrrytfftye.supabase.co`

Deploy with confidence! Just remember to whitelist new domains in TokenEx before testing transactions.

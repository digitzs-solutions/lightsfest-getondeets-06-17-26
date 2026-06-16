# TokenEx Domain Whitelisting - Quick Fix

## Problem Summary

TokenEx (IXOPAY) successfully whitelisted:
- ✅ `payvia.ai`
- ✅ `getondeets.ai`

But failed to whitelist:
- ❌ `ondeets.ai` - DNS resolution failed (domain not configured)

## Root Cause

```bash
$ curl -I https://ondeets.ai/
curl: (6) Could not resolve host: ondeets.ai
```

**The domain `ondeets.ai` has no DNS records configured**, so TokenEx validation fails because:
- Cannot establish HTTPS connection (no server responds)
- No TLS 1.2 certificate exists
- No server listening on port 443

## Quick Fix Options

### ✅ Option 1: Use payvia.ai (RECOMMENDED - Already Whitelisted!)

**Timeline: 5-10 minutes**

1. **Update DNS**: Point `payvia.ai` to your Vercel/Netlify deployment
2. **Deploy**: Your app is now at `https://payvia.ai`
3. **Done**: TokenEx already whitelisted this domain!

**Commands:**
```bash
# Update .env (already done)
VITE_PRODUCTION_URL=https://payvia.ai

# Rebuild
npm run build

# Deploy to Vercel (if using Vercel)
vercel --prod
```

### ✅ Option 2: Use getondeets.ai (Also Already Whitelisted!)

**Timeline: 5-10 minutes**

Same as Option 1, but use `https://getondeets.ai` or `https://www.getondeets.ai`

### Option 3: Fix ondeets.ai DNS

**Timeline: 30-60 minutes (includes DNS propagation)**

1. **Configure DNS** in your domain registrar:
   ```
   Type: A Record
   Name: @
   Value: [Your Vercel/Netlify IP]

   OR

   Type: CNAME
   Name: @
   Value: [Your deployment domain]
   ```

2. **Wait for DNS propagation** (5-30 minutes)

3. **Verify SSL is active**:
   ```bash
   curl -I https://ondeets.ai/
   # Should return HTTP/2 200
   ```

4. **Contact TokenEx** to re-validate `ondeets.ai`

## Current Configuration

Updated `.env` to use `payvia.ai` (already whitelisted):

```bash
VITE_PRODUCTION_URL=https://payvia.ai
```

## Next Steps

### To Use payvia.ai (Recommended):

1. **Configure DNS for payvia.ai**:
   - Go to your domain registrar (GoDaddy/Namecheap/etc.)
   - Add DNS record pointing `payvia.ai` to your deployment

2. **Update Vercel/Netlify**:
   - Add `payvia.ai` as a custom domain
   - SSL will be automatically provisioned

3. **Deploy**:
   ```bash
   npm run build
   vercel --prod  # or your deployment command
   ```

4. **Test TokenEx**:
   - Visit `https://payvia.ai`
   - Submit a payment
   - TokenEx iframe should load (already whitelisted!)

## Verification Checklist

Before going live, verify:

- [ ] Domain resolves: `curl -I https://payvia.ai/`
- [ ] Returns HTTP/2 200 OK
- [ ] Uses TLS 1.2+ (check with `openssl s_client -connect payvia.ai:443`)
- [ ] Certificate is valid from trusted CA
- [ ] Your app loads at the domain
- [ ] TokenEx iframe loads in checkout
- [ ] Test payment completes successfully

## Why ondeets.ai Failed

TokenEx validation requirements:
1. ✅ HTTPS using TLS 1.2 - **FAILED** (no server)
2. ✅ Port 443 - **FAILED** (no DNS)
3. ✅ Valid root certificate from trusted CA - **FAILED** (no cert)
4. ✅ Supports GET, POST, PUT methods - **FAILED** (no server)

**Fix**: Configure DNS records for `ondeets.ai` to point to your web server, OR use `payvia.ai`/`getondeets.ai` which are already configured and whitelisted.

## Summary

**Fastest path**: Use `payvia.ai` (already whitelisted, just needs DNS configuration to point to your deployment)

**Impact**: 5 minutes to update DNS and deploy vs. 30-60 minutes to fix `ondeets.ai`
